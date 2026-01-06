namespace scoreboard_backend.Models;

public class Player
{
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; } = 0;
    public string Tag { get; set; } = string.Empty;
    public string Final { get; set; } = "none"; // "winner", "loser", "none"
    public string Country { get; set; } = string.Empty;
}
