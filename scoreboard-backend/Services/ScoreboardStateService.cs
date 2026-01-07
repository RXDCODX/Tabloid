using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<ScoreboardStateService> _logger;

    // Поля для дебаунса записи в файл
    private readonly Lock _persistLock = new();
    private CancellationTokenSource? _persistCts;
    private readonly TimeSpan _persistDebounce = TimeSpan.FromMilliseconds(500);

    public ScoreboardStateService(
        BackgroundImagesService backgroundImagesService,
        IServiceProvider serviceCollection,
        ILogger<ScoreboardStateService> logger
    )
    {
        _backgroundImagesService = backgroundImagesService;
        _serviceCollection = serviceCollection;
        _logger = logger;

        _statePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scoreboard_state.json");
        _persistenceDisabled = string.Equals(
            Environment.GetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE"),
            "true",
            StringComparison.OrdinalIgnoreCase
        );

        _logger.LogInformation("ScoreboardStateService initializing. PersistenceDisabled={PersistenceDisabled}, StatePath={StatePath}", _persistenceDisabled, _statePath);

        LoadState();
    }

    public ScoreboardState GetState() => _state;

    public void UpdateBackgroundImage(BackgroundImage image)
    {
        _logger.LogInformation("UpdateBackgroundImage called: ImageType={ImageType}", image.ImageType);
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
        _logger.LogInformation("UpdatePlayer1 called");
        _state.Player1 = player;
        SaveState();
    }

    public void UpdatePlayer2(Player player)
    {
        _logger.LogInformation("UpdatePlayer2 called");
        _state.Player2 = player;
        SaveState();
    }

    public void UpdateMeta(MetaInfo meta)
    {
        _logger.LogInformation("UpdateMeta called");
        _state.Meta = meta;
        SaveState();
    }

    public void UpdateColors(ColorPreset colors)
    {
        _logger.LogInformation("UpdateColors called");
        _state.Colors = colors;
        SaveState();
    }

    public void UpdateVisibility(bool isVisible)
    {
        _logger.LogInformation("UpdateVisibility called: {IsVisible}", isVisible);
        _state.IsVisible = isVisible;
        SaveState();
    }

    public void UpdateAnimationDuration(int animationDuration)
    {
        _logger.LogInformation("UpdateAnimationDuration called: {Duration}", animationDuration);
        _state.AnimationDuration = animationDuration;
        SaveState();
    }

    public void UpdateShowBorders(bool isShowBorders)
    {
        _logger.LogInformation("UpdateShowBorders called: {IsShowBorders}", isShowBorders);
        _state.IsShowBorders = isShowBorders;
        SaveState();
    }

    public void UpdateLayoutConfig(LayoutConfig config)
    {
        _logger.LogInformation("UpdateLayoutConfig called");
        _state.LayoutConfig = config;
        SaveState();
    }

    public void UpdateLayoutBlock(string blockKey, LayoutBlockSizeAndPosition block)
    {
        _logger.LogInformation("UpdateLayoutBlock called: {Block}", blockKey);
        if (_state.LayoutConfig == null) _state.LayoutConfig = new LayoutConfig();
        switch (blockKey?.ToLowerInvariant())
        {
            case "center":
                _state.LayoutConfig.Center = block;
                break;
            case "left":
                _state.LayoutConfig.Left = block;
                break;
            case "right":
                _state.LayoutConfig.Right = block;
                break;
            case "fightmode":
            case "fight_mode":
                _state.LayoutConfig.FightMode = block;
                break;
            default:
                throw new ArgumentException($"Unknown layout block: {blockKey}");
        }
        SaveState();
    }

    public void UpdateLayoutField(string blockKey, string field, string? value)
    {
        _logger.LogInformation("UpdateLayoutField called: {Block}.{Field} = {Value}", blockKey, field, value);
        if (_state.LayoutConfig == null) _state.LayoutConfig = new LayoutConfig();
        LayoutBlockSizeAndPosition? target = blockKey?.ToLowerInvariant() switch
        {
            "center" => _state.LayoutConfig.Center ??= new LayoutBlockSizeAndPosition(),
            "left" => _state.LayoutConfig.Left ??= new LayoutBlockSizeAndPosition(),
            "right" => _state.LayoutConfig.Right ??= new LayoutBlockSizeAndPosition(),
            "fightmode" or "fight_mode" => _state.LayoutConfig.FightMode ??= new LayoutBlockSizeAndPosition(),
            _ => throw new ArgumentException($"Unknown layout block: {blockKey}"),
        };

        switch (field?.ToLowerInvariant())
        {
            case "top":
                target.Top = value;
                break;
            case "left":
                target.Left = value;
                break;
            case "right":
                target.Right = value;
                break;
            case "width":
                target.Width = value;
                break;
            case "height":
                target.Height = value;
                break;
            default:
                throw new ArgumentException($"Unknown layout field: {field}");
        }

        SaveState();
    }

    public void ToggleShowBorders()
    {
        _logger.LogInformation("ToggleShowBorders called (was {Old})", _state.IsShowBorders);
        _state.IsShowBorders = !_state.IsShowBorders;
        SaveState();
    }

    public void SetState(ScoreboardState state)
    {
        _logger.LogInformation("SetState called");
        _state = state;
        SaveState();
    }

    private void SaveState()
    {
        // Сохраняем старое поведение: если persistence отключен, ничего не делаем
        if (_persistenceDisabled)
        {
            _logger.LogDebug("Persistence is disabled - skipping SaveState");
            return;
        }

        // Отправляем состояние клиентам сразу (как было ранее после записи в файл)
        try
        {
            var hubContext = _serviceCollection.GetRequiredService<IHubContext<ScoreboardHub>>();
            hubContext.Clients.All.SendCoreAsync(
                ScoreboardHub.MainReceiveStateMethodName,
                new[] { _state }
            );
            _logger.LogDebug("Broadcasted state to clients");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast state to hub");
        }

        // Планируем отложенную запись в файл с дебаунсом
        lock (_persistLock)
        {
            // отменяем предыдущую отложенную запись
            _persistCts?.Cancel();
            _persistCts?.Dispose();
            _persistCts = new CancellationTokenSource();
            var ct = _persistCts.Token;

            _logger.LogDebug("Scheduling state persistence in {Debounce}ms", _persistDebounce.TotalMilliseconds);

            // Запускаем задачу, которая выполнит запись после задержки, если не отменится
            _ = Task.Run(
                async () =>
                {
                    try
                    {
                        await Task.Delay(_persistDebounce, ct).ConfigureAwait(false);
                        if (ct.IsCancellationRequested)
                        {
                            _logger.LogDebug("Persist task was cancelled before execution");
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
                        _logger.LogInformation("State persisted to disk: {Path}", _statePath);
                    }
                    catch (OperationCanceledException)
                    {
                        // отмена - игнорируем
                        _logger.LogDebug("Persist task cancelled (OperationCanceledException)");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error while persisting state to disk");
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
            _logger.LogInformation("No persisted state found. Using default state.");
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
            _logger.LogInformation("Loaded persisted state from disk: {Path}", _statePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load persisted state. Using default state.");
            _state = new ScoreboardState();
        }
    }

    public void ResetToDefault()
    {
        _logger.LogInformation("ResetToDefault called");
        _state = new ScoreboardState();
        SaveState();
    }
}
