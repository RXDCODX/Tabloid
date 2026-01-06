namespace scoreboard_backend.Models;

public class ColorPreset
{
    public string Name { get; set; } = string.Empty;
    public string MainColor { get; set; } = "#3F00FF"; // Основной цвет для тегов и неонового свечения
    public string PlayerNamesColor { get; set; } = "#ffffff"; // Цвет имен игроков
    public string TournamentTitleColor { get; set; } = "#3F00FF"; // Цвет названия турнира
    public string FightModeColor { get; set; } = "#3F00FF"; // Цвет режима драки
    public string ScoreColor { get; set; } = "#ffffff"; // Цвет счета
    public string BackgroundColor { get; set; } = "#23272f"; // Цвет фона всех дивов
    public string BorderColor { get; set; } = "#3F00FF"; // Цвет обводки всех дивов
}
