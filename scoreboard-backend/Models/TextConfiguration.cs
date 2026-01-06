namespace scoreboard_backend.Models;

public class TextConfiguration
{
    public string Player1NameText { get; set; } = string.Empty; // Настраиваемый текст для имени игрока 1
    public string Player2NameText { get; set; } = string.Empty; // Настраиваемый текст для имени игрока 2
    public string TournamentTitleText { get; set; } = string.Empty; // Настраиваемый текст для названия турнира
    public string FightModeText { get; set; } = string.Empty; // Настраиваемый текст для режима драки
    public string Player1ScoreText { get; set; } = string.Empty; // Настраиваемый текст для счета игрока 1
    public string Player2ScoreText { get; set; } = string.Empty; // Настраиваемый текст для счета игрока 2
}
