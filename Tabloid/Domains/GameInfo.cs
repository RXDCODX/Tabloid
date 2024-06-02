namespace Main.Domains;

public class GameInfo
{
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    public Player Player1 { get; set; } = new Player();
    public Player Player2 { get; set; } = new Player();

    public int P1Wins => Player1.Counter;

    public int P2Wins => Player2.Counter;
}