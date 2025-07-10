using Microsoft.AspNetCore.SignalR;
using Tabloid.Domains;
using Tabloid.Services;

namespace Tabloid.Hubs;

public class MainHub(Methods methods, ILogger<MainHub> logger) : Hub<IMainHub>
{
    public Task Reset()
    {
        try
        {
            methods.Reset();
        }
        catch (Exception e)
        {
            logger.LogError(
                "{Message}{NewLine}{StackTrace}",
                e.Message,
                Environment.NewLine,
                e.StackTrace
            );
        }
        return Clients.All.Update(DataHost.Data);
    }

    public Task SwapPlayers()
    {
        try
        {
            methods.SwitchPlayers();
        }
        catch (Exception e)
        {
            logger.LogError(
                "{Message}{NewLine}{StackTrace}",
                e.Message,
                Environment.NewLine,
                e.StackTrace
            );
        }
        return Clients.All.Update(DataHost.Data);
    }

    public Task SwapNames()
    {
        try
        {
            methods.SwitchPlayerNames();
        }
        catch (Exception e)
        {
            logger.LogError(
                "{Message}{NewLine}{StackTrace}",
                e.Message,
                Environment.NewLine,
                e.StackTrace
            );
        }
        return Clients.All.Update(DataHost.Data);
    }

    public Task SwapCountry()
    {
        try
        {
            methods.SwitchPlayerCountryes();
        }
        catch (Exception e)
        {
            logger.LogError(
                "{Message}{NewLine}{StackTrace}",
                e.Message,
                Environment.NewLine,
                e.StackTrace
            );
        }
        return Clients.All.Update(DataHost.Data);
    }

    public Task Update(MainModel data)
    {
        try
        {
            DataHost.Data = data;
        }
        catch (Exception e)
        {
            logger.LogError(
                "{Message}{NewLine}{StackTrace}",
                e.Message,
                Environment.NewLine,
                e.StackTrace
            );
        }
        return Clients.Others.Update(DataHost.Data);
    }

    public Task GetOnStartup()
    {
        return Clients.Caller.GetOnStartup(DataHost.Data);
    }
}
