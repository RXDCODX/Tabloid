using System.Text.Json;

namespace scoreboard_backend.Services;

public class ScoreboardStateService
{
    private JsonDocument? _state;
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

    public JsonDocument GetState() => _state ?? throw new InvalidOperationException("State not initialized");

    public void SetState(JsonDocument state)
    {
        _state?.Dispose();
        _state = state;
        SaveState();
    }

    public void SetStateFromJson(string jsonString)
    {
        if (string.IsNullOrWhiteSpace(jsonString))
        {
            ResetToDefault();
            return;
        }

        try
        {
            var newState = JsonDocument.Parse(jsonString);
            SetState(newState);
        }
        catch
        {
            // Если JSON некорректный, сбрасываем к дефолтному состоянию
            ResetToDefault();
        }
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

            var json = _state?.RootElement.GetRawText() ?? "{}";
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
            ResetToDefault();
            return;
        }

        try
        {
            var json = File.ReadAllText(_statePath);
            if (string.IsNullOrWhiteSpace(json))
            {
                ResetToDefault();
                return;
            }

            _state = JsonDocument.Parse(json);
        }
        catch
        {
            ResetToDefault();
        }
    }

    public void ResetToDefault()
    {
        _state?.Dispose();
        
        var defaultJson = """
        {
            "player1": {
                "name": "Player 1",
                "sponsor": "",
                "score": 0,
                "tag": "",
                "flag": "none",
                "final": "none"
            },
            "player2": {
                "name": "Player 2",
                "sponsor": "",
                "score": 0,
                "tag": "",
                "flag": "none",
                "final": "none"
            },
            "meta": {
                "title": "Tournament",
                "fightRule": "Grand Finals"
            },
            "colors": {
                "name": "",
                "mainColor": "#3F00FF",
                "playerNamesColor": "#ffffff",
                "tournamentTitleColor": "#3F00FF",
                "fightModeColor": "#3F00FF",
                "scoreColor": "#ffffff",
                "backgroundColor": "#23272f",
                "borderColor": "#3F00FF"
            },
            "textConfig": {},
            "backgroundImages": {},
            "layoutConfig": {
                "center": { "top": "15px", "left": "50%", "width": "540px", "height": "60px" },
                "left": { "top": "15px", "left": "167px", "width": "540px", "height": "120px" },
                "right": { "top": "15px", "right": "167px", "width": "540px", "height": "120px" },
                "fightMode": { "top": "150px", "left": "50%", "width": "300px", "height": "50px" }
            },
            "isVisible": true,
            "animationDuration": 800,
            "showBorders": false
        }
        """;
        
        _state = JsonDocument.Parse(defaultJson);
        SaveState();
    }

    public void Dispose()
    {
        _state?.Dispose();
    }
}
