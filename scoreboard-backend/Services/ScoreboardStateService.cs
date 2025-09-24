using System.Text.Json;
using scoreboard_backend.Models;
using scoreboard_backend.Serialization;

namespace scoreboard_backend.Services;

public class ScoreboardStateService
{
    private ScoreboardState _state = new();
    private readonly string _statePath;
    private readonly bool _persistenceDisabled;

    public ScoreboardStateService()
    {
        _statePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scoreboard_state.json");
        _persistenceDisabled = string.Equals(
            Environment.GetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE"),
            "true",
            StringComparison.OrdinalIgnoreCase
        );
        LoadState();
    }

    public ScoreboardState GetState() => _state;

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

    public void SetState(ScoreboardState state)
    {
        _state = state;
        SaveState();
    }

    private void SaveState()
    {
        if (_persistenceDisabled)
        {
            return;
        }

        try
        {
            var dir = Path.GetDirectoryName(_statePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            var json = JsonSerializer.Serialize(
                _state,
                ScoreboardJsonContext.Default.ScoreboardState
            );
            File.WriteAllText(_statePath, json);
        }
        catch
        {
            // ignore
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
