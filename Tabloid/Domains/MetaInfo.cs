namespace Main.Domains;

public class MetaInfo
{
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    public string Commentators { get; set; } = string.Empty;
    public string FightRule { get; set; } = string.Empty;
    public string Notation { get; set; } = string.Empty;
    public string Sponsor { get; set; } = string.Empty;
    public string Prizepool { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.


    /// <summary>
    /// Количество игроков в турнире
    /// </summary>
    public int PlayersCount { get; set; } = 2;
}