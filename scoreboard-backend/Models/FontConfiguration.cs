namespace scoreboard_backend.Models;

public class FontConfiguration
{
    public string PlayerNameFont { get; set; } = string.Empty; // Шрифт для имен игроков
    public double PlayerNameFontSize { get; set; } = 0; // Размер шрифта для имен игроков
    public string PlayerTagFont { get; set; } = string.Empty; // Шрифт для тегов игроков
    public double PlayerTagFontSize { get; set; } = 0; // Размер шрифта для тегов игроков
    public string ScoreFont { get; set; } = string.Empty; // Шрифт для счета
    public double ScoreFontSize { get; set; } = 0; // Размер шрифта для счета
    public string TournamentTitleFont { get; set; } = string.Empty; // Шрифт для заголовка турнира
    public double TournamentTitleFontSize { get; set; } = 0; // Размер шрифта для заголовка турнира
    public string FightModeFont { get; set; } = string.Empty; // Шрифт для правила драки
    public double FightModeFontSize { get; set; } = 0; // Размер шрифта для правила драки
    public string CommentatorNameFont { get; set; } = string.Empty; // Шрифт для имен комментаторов
    public double CommentatorNameFontSize { get; set; } = 0; // Размер шрифта для имен комментаторов
    public string CommentatorTagFont { get; set; } = string.Empty; // Шрифт для тегов комментаторов
    public double CommentatorTagFontSize { get; set; } = 0; // Размер шрифта для тегов комментаторов
    public string CommentatorScoreFont { get; set; } = string.Empty; // Шрифт для счета комментаторов
    public double CommentatorScoreFontSize { get; set; } = 0; // Размер шрифта для счета комментаторов
}
