using Main.Domains;

namespace Main.Services;

public class DataHost
{
    public static MainModel Data { get; set; } = new();
}