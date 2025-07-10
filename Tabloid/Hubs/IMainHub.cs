using Main.Domains;

namespace Tabloid.Hubs;

public interface IMainHub
{
    public Task Update(MainModel data);
    public Task GetOnStartup(MainModel data);
}
