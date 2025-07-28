namespace scoreboard_backend.Models;

public class Player
{
    public string Name { get; set; } = string.Empty;
    public string Sponsor { get; set; } = string.Empty;
    public int Score { get; set; } = 0;
    public string Tag { get; set; } = string.Empty;
    public string Final { get; set; } = "none"; // "winner", "loser", "none"
    public string Flag { get; set; } = string.Empty;
}

public class MetaInfo
{
    public string Title { get; set; } = string.Empty;
    public string FightRule { get; set; } = string.Empty;
}

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

public class ScoreboardState
{
    public Player Player1 { get; set; } = new Player();
    public Player Player2 { get; set; } = new Player();
    public MetaInfo Meta { get; set; } = new MetaInfo();
    public ColorPreset Colors { get; set; } = new ColorPreset();
    public bool IsVisible { get; set; } = true; // Новое поле для управления видимостью
    public int AnimationDuration { get; set; } = 800; // Время анимации в миллисекундах
}
