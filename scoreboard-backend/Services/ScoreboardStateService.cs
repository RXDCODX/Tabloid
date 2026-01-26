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

    private readonly bool _persistenceDisabled;

    private readonly BackgroundImagesService _backgroundImagesService;
    private readonly IServiceProvider _serviceCollection;
    private readonly ILogger<ScoreboardStateService> _logger;
    private readonly DatabaseService _databaseService;

    // Поля для дебаунса записи
    private readonly Lock _persistLock = new();
    private CancellationTokenSource? _persistCts;
    private readonly TimeSpan _persistDebounce = TimeSpan.FromMilliseconds(500);

    public ScoreboardStateService(
        BackgroundImagesService backgroundImagesService,
        IServiceProvider serviceCollection,
        ILogger<ScoreboardStateService> logger,
        DatabaseService databaseService
    )
    {
        _backgroundImagesService = backgroundImagesService;
        _serviceCollection = serviceCollection;
        _logger = logger;
        _databaseService = databaseService;

        _persistenceDisabled = string.Equals(
            Environment.GetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE"),
            "true",
            StringComparison.OrdinalIgnoreCase
        );

        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation(
                "ScoreboardStateService initializing. PersistenceDisabled={PersistenceDisabled}, DB={Db}",
                _persistenceDisabled,
                _databaseService.GetConnectionString()
            );
        }

        LoadState();
    }

    public ScoreboardState GetState() => _state;

    public void UpdateBackgroundImage(BackgroundImage image)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation(
                "UpdateBackgroundImage called: ImageType={ImageType}, IsShouldExists={IsShouldExists}",
                image.ImageType,
                image.IsShouldExists
            );
        }

        // Update files on disk or remove them
        _backgroundImagesService.UpdateBackgroundImage(image).GetAwaiter().GetResult();

        // Update in-memory state: if image removed -> set corresponding property to null
        switch (image.ImageType)
        {
            case ImageType.None:
                throw new ArgumentException("Invalid image type");
            case ImageType.LeftImage:
                _state.Images.LeftImage = image.IsShouldExists ? image : null;
                break;
            case ImageType.RightImage:
                _state.Images.RightImage = image.IsShouldExists ? image : null;
                break;
            case ImageType.TopImage:
                _state.Images.CenterImage = image.IsShouldExists ? image : null;
                break;
            case ImageType.FightModeImage:
                _state.Images.FightModeImage = image.IsShouldExists ? image : null;
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(image));
        }

        SaveState();
    }

    public void UpdatePlayer1(Player player)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdatePlayer1 called");
        }

        _state.Player1 = player;
        SaveState();
    }

    public void UpdatePlayer2(Player player)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdatePlayer2 called");
        }

        _state.Player2 = player;
        SaveState();
    }

    public void UpdateMeta(MetaInfo meta)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdateMeta called");
        }

        _state.Meta = meta;
        SaveState();
    }

    public void UpdateColors(ColorPreset colors)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdateColors called");
        }

        _state.Colors = colors;
        SaveState();
    }

    public void UpdateVisibility(bool isVisible)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdateVisibility called: {IsVisible}", isVisible);
        }

        _state.IsVisible = isVisible;
        SaveState();
    }

    public void UpdateAnimationDuration(int animationDuration)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdateAnimationDuration called: {Duration}", animationDuration);
        }

        _state.AnimationDuration = animationDuration;
        SaveState();
    }

    public void UpdateShowBorders(bool isShowBorders)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdateShowBorders called: {IsShowBorders}", isShowBorders);
        }

        _state.IsShowBorders = isShowBorders;
        SaveState();
    }

    public void ToggleShowBorders()
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("ToggleShowBorders called (was {Old})", _state.IsShowBorders);
        }

        _state.IsShowBorders = !_state.IsShowBorders;
        SaveState();
    }

    public void SetState(ScoreboardState state)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("SetState called");
        }

        _state = state;
        SaveState();
    }

    // New layout-related methods
    public void UpdateLayoutConfig(LayoutConfig config)
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("UpdateLayoutConfig called");
        }

        _state.LayoutConfig = config ?? new LayoutConfig();
        SaveState();
    }

    private void SaveState()
    {
        // Сохраняем старое поведение: если persistence отключен, ничего не делаем
        if (_persistenceDisabled)
        {
            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("Persistence is disabled - skipping SaveState");
            }

            return;
        }

        // ВАЖНО: НЕ отправляем состояние здесь, это делают методы Hub'а
        // Двойная отправка через IHubContext и Hub может вызывать проблемы

        // Планируем отложенную запись с дебаунсом
        lock (_persistLock)
        {
            // отменяем предыдущую отложенную запись
            _persistCts?.Cancel();
            _persistCts?.Dispose();
            _persistCts = new CancellationTokenSource();
            var ct = _persistCts.Token;

            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug(
                    "Scheduling state persistence in {Debounce}ms",
                    _persistDebounce.TotalMilliseconds
                );
            }

            // Запускаем задачу, которая выполнит запись после задержки, если не отменится
            _ = Task.Run(
                async () =>
                {
                    try
                    {
                        await Task.Delay(_persistDebounce, ct).ConfigureAwait(false);
                        if (ct.IsCancellationRequested)
                        {
                            if (_logger.IsEnabled(LogLevel.Debug))
                            {
                                _logger.LogDebug("Persist task was cancelled before execution");
                            }

                            return;
                        }

                        var json = JsonSerializer.Serialize(
                            _state,
                            ScoreboardJsonContext.Default.ScoreboardState
                        );

                        // Save to DB instead of file
                        _databaseService.SaveStateJson(json);

                        if (_logger.IsEnabled(LogLevel.Information))
                        {
                            _logger.LogInformation("State persisted to DB");
                        }
                    }
                    catch (OperationCanceledException)
                    {
                        // отмена - игнорируем
                        if (_logger.IsEnabled(LogLevel.Debug))
                        {
                            _logger.LogDebug("Persist task cancelled (OperationCanceledException)");
                        }
                    }
                    catch (Exception ex)
                    {
                        if (_logger.IsEnabled(LogLevel.Error))
                        {
                            _logger.LogError(ex, "Error while persisting state to DB");
                        }
                    }
                },
                CancellationToken.None
            );
        }
    }

    private void LoadState()
    {
        try
        {
            var json = _databaseService.LoadStateJson();
            if (string.IsNullOrEmpty(json))
            {
                _state = new ScoreboardState();
                if (_logger.IsEnabled(LogLevel.Information))
                {
                    _logger.LogInformation("No persisted state found in DB. Using default state.");
                }

                return;
            }

            var loaded = JsonSerializer.Deserialize(
                json,
                ScoreboardJsonContext.Default.ScoreboardState
            );
            _state = loaded ?? new ScoreboardState();
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("Loaded persisted state from DB");
            }
        }
        catch (Exception ex)
        {
            if (_logger.IsEnabled(LogLevel.Error))
            {
                _logger.LogError(
                    ex,
                    "Failed to load persisted state from DB. Using default state."
                );
            }

            _state = new ScoreboardState();
        }
    }

    public void ResetToDefault()
    {
        if (_logger.IsEnabled(LogLevel.Information))
        {
            _logger.LogInformation("ResetToDefault called");
        }

        _state = new ScoreboardState();
        SaveState();
    }
}
