namespace Main.Domains;

public class MetaInfo
{
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    public string Commentators { get; set; } = "PYROKXNEZXZ";
    public string FightRule { get; set; } = "FT2";
    public string Notation { get; set; } = "TEXT";
    public string Sponsor { get; set; } = "IMANA";
    public string Prizepool { get; set; } = "4000RUB";

    public string Title { get; set; } = "sadjklsdflk";
    public string Url { get; set; } = "twitch.pyrokxnezxz";
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.


    /// <summary>
    /// Количество игроков в турнире
    /// </summary>
    public int PlayersCount { get; set; } = 2;
}