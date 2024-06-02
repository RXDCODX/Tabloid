using Main.Domains;

namespace Main.Hubs;

public interface IMainHub
{
    public Task Update(string content);
    public Task GetOnStartup(string content);
}