using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Hubs;
using scoreboard_backend.Models;
using scoreboard_backend.Serialization;

namespace scoreboard_backend.Services;

public class ScoreboardStateService
{
    private ScoreboardState _state = new();

    private readonly string _statePath;
    private readonly bool _persistenceDisabled;

    private readonly BackgroundImagesService _backgroundImagesService;
    private readonly IServiceProvider _serviceCollection;

    // Поля для дебаунса записи в файл
    private readonly Lock _persistLock = new();
    private CancellationTokenSource? _persistCts;
    private readonly TimeSpan _persistDebounce = TimeSpan.FromMilliseconds(500);

    public ScoreboardStateService(
        BackgroundImagesService backgroundImagesService,
        IServiceProvider serviceCollection
    )
    {
        _backgroundImagesService = backgroundImagesService;
        _serviceCollection = serviceCollection;

        _statePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scoreboard_state.json");
        _persistenceDisabled = string.Equals(
            Environment.GetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE"),
            "true",
            StringComparison.OrdinalIgnoreCase
        );

        LoadState();
    }

    public ScoreboardState GetState() => _state;

    public void UpdateBackgroundImage(BackgroundImage image)
    {
        _backgroundImagesService.UpdateBackgroundImage(image).GetAwaiter().GetResult();
        switch (image.ImageType)
        {
            case ImageType.None:
                throw new ArgumentException("Еблан?");
            case ImageType.LeftImage:
                _state.Images.LeftImage = image;
                break;
            case ImageType.RightImage:
                _state.Images.RightImage = image;
                break;
            case ImageType.TopImageg:
                _state.Images.CenterImage = image;
                break;
            case ImageType.FightModeImage:
                _state.Images.FightModeImage = image;
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(image));
        }
        SaveState();
    }

    public void UpdatePlayer1(Player player)
    {
        _state.Player1 = player;
        SaveState();
    }

    public void UpdatePlayer2(Player player)
    {
        _state.Player2 = player;
        SaveState();
    }

    public void UpdateMeta(MetaInfo meta)
    {
        _state.Meta = meta;
        SaveState();
    }

    public void UpdateColors(ColorPreset colors)
    {
        _state.Colors = colors;
        SaveState();
    }

    public void UpdateVisibility(bool isVisible)
    {
        _state.IsVisible = isVisible;
        SaveState();
    }

    public void UpdateAnimationDuration(int animationDuration)
    {
        _state.AnimationDuration = animationDuration;
        SaveState();
    }

    public void UpdateShowBorders(bool isShowBorders)
    {
        _state.IsShowBorders = isShowBorders;
        SaveState();
    }

    public void ToggleShowBorders()
    {
        _state.IsShowBorders = !_state.IsShowBorders;
        SaveState();
    }

    public void SetState(ScoreboardState state)
    {
        _state = state;
        SaveState();
    }

    private void SaveState()
    {
        // Сохраняем старое поведение: если persistence отключен, ничего не делаем
        if (_persistenceDisabled)
        {
            return;
        }

        // Отправляем состояние клиентам сразу (как было ранее после записи в файл)
        try
        {
            var hubContext = _serviceCollection.GetRequiredService<IHubContext<ScoreboardHub>>();
            hubContext.Clients.All.SendCoreAsync(
                ScoreboardHub.MainReceiveStateMethodName,
                [_state]
            );
        }
        catch
        {
            // ignore hub errors
        }

        // Планируем отложенную запись в файл с дебаунсом
        lock (_persistLock)
        {
            // отменяем предыдущую отложенную запись
            _persistCts?.Cancel();
            _persistCts?.Dispose();
            _persistCts = new CancellationTokenSource();
            var ct = _persistCts.Token;

            // Запускаем задачу, которая выполнит запись после задержки, если не отменится
            _ = Task.Run(
                async () =>
                {
                    try
                    {
                        await Task.Delay(_persistDebounce, ct).ConfigureAwait(false);
                        if (ct.IsCancellationRequested)
                        {
                            return;
                        }

                        var dir = Path.GetDirectoryName(_statePath);
                        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                        {
                            Directory.CreateDirectory(dir);
                        }

                        var json = JsonSerializer.Serialize(
                            _state,
                            ScoreboardJsonContext.Default.ScoreboardState
                        );
                        await File.WriteAllTextAsync(_statePath, json, ct);
                    }
                    catch (OperationCanceledException)
                    {
                        // отмена - игнорируем
                    }
                    catch
                    {
                        // ignore other errors
                    }
                },
                CancellationToken.None
            );
        }
    }

    private void LoadState()
    {
        if (!File.Exists(_statePath))
        {
            _state = new ScoreboardState();
            return;
        }

        try
        {
            var json = File.ReadAllText(_statePath);
            var loaded = JsonSerializer.Deserialize(
                json,
                ScoreboardJsonContext.Default.ScoreboardState
            );
            _state = loaded ?? new ScoreboardState();
        }
        catch
        {
            _state = new ScoreboardState();
        }
    }

    public void ResetToDefault()
    {
        _state = new ScoreboardState();
        SaveState();
    }
}
