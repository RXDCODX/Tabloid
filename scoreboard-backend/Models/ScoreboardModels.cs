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

public class TextConfiguration
{
    public string Player1NameText { get; set; } = string.Empty; // Настраиваемый текст для имени игрока 1
    public string Player2NameText { get; set; } = string.Empty; // Настраиваемый текст для имени игрока 2
    public string TournamentTitleText { get; set; } = string.Empty; // Настраиваемый текст для названия турнира
    public string FightModeText { get; set; } = string.Empty; // Настраиваемый текст для режима драки
    public string Player1ScoreText { get; set; } = string.Empty; // Настраиваемый текст для счета игрока 1
    public string Player2ScoreText { get; set; } = string.Empty; // Настраиваемый текст для счета игрока 2
}

public class BackgroundImages
{
    public string CenterImage { get; set; } = string.Empty; // Фоновое изображение для центрального блока
    public string LeftImage { get; set; } = string.Empty; // Фоновое изображение для левого блока
    public string RightImage { get; set; } = string.Empty; // Фоновое изображение для правого блока
    public string FightModeImage { get; set; } = string.Empty; // Фоновое изображение для блока режима драки
}

public class ScoreboardState
{
    public Player Player1 { get; set; } = new Player();
    public Player Player2 { get; set; } = new Player();
    public MetaInfo Meta { get; set; } = new MetaInfo();
    public ColorPreset Colors { get; set; } = new ColorPreset();
    public TextConfiguration TextConfig { get; set; } = new TextConfiguration();
    public BackgroundImages BackgroundImages { get; set; } = new BackgroundImages();
    public bool IsVisible { get; set; } = true; // Новое поле для управления видимостью
    public int AnimationDuration { get; set; } = 800; // Время анимации в миллисекундах
}
