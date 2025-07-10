namespace Tabloid.Domains;

public class MainModel
{
    public GameInfo GameInfo { get; set; } = new GameInfo();
    public MetaInfo Meta { get; set; } = new MetaInfo();
}
