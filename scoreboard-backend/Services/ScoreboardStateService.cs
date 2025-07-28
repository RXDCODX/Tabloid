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
        // Player1
        _config.Set("Player1", "Name", _state.Player1.Name);
        _config.Set("Player1", "Sponsor", _state.Player1.Sponsor);
        _config.Set("Player1", "Score", _state.Player1.Score.ToString());
        _config.Set("Player1", "Tag", _state.Player1.Tag);
        _config.Set("Player1", "Flag", _state.Player1.Flag);
        _config.Set("Player1", "Final", _state.Player1.Final);
        // Player2
        _config.Set("Player2", "Name", _state.Player2.Name);
        _config.Set("Player2", "Sponsor", _state.Player2.Sponsor);
        _config.Set("Player2", "Score", _state.Player2.Score.ToString());
        _config.Set("Player2", "Tag", _state.Player2.Tag);
        _config.Set("Player2", "Flag", _state.Player2.Flag);
        _config.Set("Player2", "Final", _state.Player2.Final);
        // Meta
        _config.Set("Meta", "Title", _state.Meta.Title);
        _config.Set("Meta", "FightRule", _state.Meta.FightRule);
        // Colors
        _config.Set("Colors", "Name", _state.Colors.Name);
        _config.Set("Colors", "MainColor", _state.Colors.MainColor);
        _config.Set("Colors", "PlayerNamesColor", _state.Colors.PlayerNamesColor);
        _config.Set("Colors", "TournamentTitleColor", _state.Colors.TournamentTitleColor);
        _config.Set("Colors", "FightModeColor", _state.Colors.FightModeColor);
        _config.Set("Colors", "ScoreColor", _state.Colors.ScoreColor);
        _config.Set("Colors", "BackgroundColor", _state.Colors.BackgroundColor);
        _config.Set("Colors", "BorderColor", _state.Colors.BorderColor);
        // Visibility
        _config.Set("Scoreboard", "IsVisible", _state.IsVisible.ToString());
        // Animation Duration
        _config.Set("Scoreboard", "AnimationDuration", _state.AnimationDuration.ToString());
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
            Flag = _config.Get("Player1", "Flag", "none")!,
        };
        var p2 = new Player
        {
            Name = _config.Get("Player2", "Name", "Player 2")!,
            Sponsor = _config.Get("Player2", "Sponsor", "")!,
            Score = int.TryParse(_config.Get("Player2", "Score", "0"), out var s2) ? s2 : 0,
            Tag = _config.Get("Player2", "Tag", "")!,
            Final = _config.Get("Player2", "Final", "none")!,
            Flag = _config.Get("Player2", "Flag", "none")!,
        };
        var meta = new MetaInfo
        {
            Title = _config.Get("Meta", "Title", "")!,
            FightRule = _config.Get("Meta", "FightRule", "")!,
        };
        var colors = new ColorPreset
        {
            Name = _config.Get("Colors", "Name", "Default")!,
            MainColor = _config.Get("Colors", "MainColor", "#3F00FF")!,
            PlayerNamesColor = _config.Get("Colors", "PlayerNamesColor", "#ffffff")!,
            TournamentTitleColor = _config.Get("Colors", "TournamentTitleColor", "#3F00FF")!,
            FightModeColor = _config.Get("Colors", "FightModeColor", "#3F00FF")!,
            ScoreColor = _config.Get("Colors", "ScoreColor", "#ffffff")!,
            BackgroundColor = _config.Get("Colors", "BackgroundColor", "#23272f")!,
            BorderColor = _config.Get("Colors", "BorderColor", "#3F00FF")!,
        };
        var isVisible =
            !bool.TryParse(_config.Get("Scoreboard", "IsVisible", "true"), out var visible)
            || visible;

        var animationDuration =
            int.TryParse(_config.Get("Scoreboard", "AnimationDuration", "800"), out var duration)
            ? duration : 800;

        _state = new ScoreboardState
        {
            Player1 = p1,
            Player2 = p2,
            Meta = meta,
            Colors = colors,
            IsVisible = isVisible,
            AnimationDuration = animationDuration,
        };
    }

    public void ResetToDefault()
    {
        _state = new ScoreboardState();
        SaveState();
    }
}
