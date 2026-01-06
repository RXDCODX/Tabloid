namespace scoreboard_backend.Models;

public class ScoreboardState
{
    public Player Player1 { get; set; } = new();
    public Player Player2 { get; set; } = new();
    public MetaInfo Meta { get; set; } = new();
    public ColorPreset Colors { get; set; } = new();
    public TextConfiguration TextConfig { get; set; } = new();
    public Images Images { get; set; } = new();
    public bool IsVisible { get; set; } = true; // Новое поле для управления видимостью
    public int AnimationDuration { get; set; } = 2000; // Время анимации в миллисекундах
    public bool IsShowBorders { get; set; } = false;
}
