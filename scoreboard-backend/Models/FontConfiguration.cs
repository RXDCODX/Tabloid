namespace scoreboard_backend.Models;

public class FontConfiguration
{
    public string PlayerNameFont { get; set; } = string.Empty; // Шрифт для имен игроков
    public string PlayerTagFont { get; set; } = string.Empty; // Шрифт для тегов игроков
    public string ScoreFont { get; set; } = string.Empty; // Шрифт для счета
    public string TournamentTitleFont { get; set; } = string.Empty; // Шрифт для заголовка турнира
    public string FightModeFont { get; set; } = string.Empty; // Шрифт для правила драки
    public string CommentatorNameFont { get; set; } = string.Empty; // Шрифт для имен комментаторов
    public string CommentatorTagFont { get; set; } = string.Empty; // Шрифт для тегов комментаторов
    public string CommentatorScoreFont { get; set; } = string.Empty; // Шрифт для счета комментаторов
}
