namespace Tabloid.Domains;

public class GameInfo
{
    public Player Player1 { get; set; } = new Player();
    public Player Player2 { get; set; } = new Player();

    public int P1Wins => Player1.Counter;

    public int P2Wins => Player2.Counter;
}
