using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class ScoreboardStateService
{
    private ScoreboardState _state = new();
    private readonly IniConfig _config;

    public ScoreboardStateService()
    {
        var iniPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.ini");
        _config = new IniConfig(iniPath);
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

    public void SetState(ScoreboardState state)
    {
        _state = state;
        SaveState();
    }

    private void SaveState()
    {
        // Player1
        _config.Set("Player1", "Name", _state.Player1.Name);
        _config.Set("Player1", "Sponsor", _state.Player1.Sponsor);
        _config.Set("Player1", "Score", _state.Player1.Score.ToString());
        _config.Set("Player1", "Tag", _state.Player1.Tag);
        _config.Set("Player1", "Final", _state.Player1.Final);
        // Player2
        _config.Set("Player2", "Name", _state.Player2.Name);
        _config.Set("Player2", "Sponsor", _state.Player2.Sponsor);
        _config.Set("Player2", "Score", _state.Player2.Score.ToString());
        _config.Set("Player2", "Tag", _state.Player2.Tag);
        _config.Set("Player2", "Final", _state.Player2.Final);
        // Meta
        _config.Set("Meta", "Title", _state.Meta.Title);
        _config.Set("Meta", "FightRule", _state.Meta.FightRule);
        // Colors
        _config.Set("Colors", "Name", _state.Colors.Name);
        _config.Set("Colors", "TextColor", _state.Colors.TextColor);
        _config.Set("Colors", "ScoreColor", _state.Colors.ScoreColor);
        _config.Set("Colors", "ScoreBackgroundColor", _state.Colors.ScoreBackgroundColor);
        _config.Set("Colors", "TitleColor", _state.Colors.TitleColor);
        _config.Set("Colors", "BackgroundColor", _state.Colors.BackgroundColor);
        _config.Save();
    }

    private void LoadState()
    {
        var p1 = new Player
        {
            Name = _config.Get("Player1", "Name", "Player 1")!,
            Sponsor = _config.Get("Player1", "Sponsor", "")!,
            Score = int.TryParse(_config.Get("Player1", "Score", "0"), out var s1) ? s1 : 0,
            Tag = _config.Get("Player1", "Tag", "")!,
            Final = _config.Get("Player1", "Final", "none")!,
        };
        var p2 = new Player
        {
            Name = _config.Get("Player2", "Name", "Player 2")!,
            Sponsor = _config.Get("Player2", "Sponsor", "")!,
            Score = int.TryParse(_config.Get("Player2", "Score", "0"), out var s2) ? s2 : 0,
            Tag = _config.Get("Player2", "Tag", "")!,
            Final = _config.Get("Player2", "Final", "none")!,
        };
        var meta = new MetaInfo
        {
            Title = _config.Get("Meta", "Title", "")!,
            FightRule = _config.Get("Meta", "FightRule", "")!,
        };
        var colors = new ColorPreset
        {
            Name = _config.Get("Colors", "Name", "Default")!,
            TextColor = _config.Get("Colors", "TextColor", "#ffffff")!,
            ScoreColor = _config.Get("Colors", "ScoreColor", "#0dcaf0")!,
            ScoreBackgroundColor = _config.Get("Colors", "ScoreBackgroundColor", "#23272f")!,
            TitleColor = _config.Get("Colors", "TitleColor", "#ffc107")!,
            BackgroundColor = _config.Get("Colors", "BackgroundColor", "#23272f")!,
        };
        _state = new ScoreboardState
        {
            Player1 = p1,
            Player2 = p2,
            Meta = meta,
            Colors = colors,
        };
    }

    public void ResetToDefault()
    {
        _state = new ScoreboardState();
        SaveState();
    }
}
