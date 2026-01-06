namespace scoreboard_backend.Models;

public class ColorPresetModel
{
    public string Name { get; set; } = string.Empty;
    public string? PlayerNamesColor { get; set; }
    public string? TournamentTitleColor { get; set; }
    public string? FightModeColor { get; set; }
    public string? ScoreColor { get; set; }
}
