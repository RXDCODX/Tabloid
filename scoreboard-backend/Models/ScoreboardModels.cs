namespace scoreboard_backend.Models
{
    public class Player
    {
        public string Name { get; set; } = string.Empty;
        public string Sponsor { get; set; } = string.Empty;
        public int Score { get; set; } = 0;
        public string Tag { get; set; } = string.Empty;
        public string Final { get; set; } = "none"; // winner, loser, none
    }

    public class MetaInfo
    {
        public string Title { get; set; } = string.Empty;
        public string FightRule { get; set; } = string.Empty;
    }

    public class ScoreboardState
    {
        public Player Player1 { get; set; } = new Player();
        public Player Player2 { get; set; } = new Player();
        public MetaInfo Meta { get; set; } = new MetaInfo();
    }
} 