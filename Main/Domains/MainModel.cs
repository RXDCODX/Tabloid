using System.Runtime.InteropServices.Marshalling;

namespace Main.Domains;

public class MainModel
{
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

    public GameInfo GameInfo { get; set; } = new GameInfo();
    public MetaInfo Meta { get; set; } = new MetaInfo();

}