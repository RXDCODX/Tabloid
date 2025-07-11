namespace Tabloid.Domains;

public class MetaInfo
{
    public string Commentators { get; set; } = string.Empty;
    public string FightRule { get; set; } = nameof(FightRule);
    public string Notation { get; set; } = string.Empty;
    public string Sponsor { get; set; } = string.Empty;
    public string Prizepool { get; set; } = string.Empty;

    public string Title { get; set; } = nameof(Title);
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Количество игроков в турнире
    /// </summary>
    public int PlayersCount { get; set; } = 2;
}
