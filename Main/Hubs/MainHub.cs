using System.Text.Json;
using Main.Domains;
using Main.Services;
using Microsoft.AspNetCore.SignalR;

namespace Main.Hubs;

public class MainHub : Hub<IMainHub>
{
    private readonly Methods _methods;
    private readonly ILogger<MainHub> _logger;

    public MainHub(Methods methods, ILogger<MainHub> logger)
    {
        _methods = methods;
        _logger = logger;
    }

    public Task Reset()
    {
        try
        {
            _methods.Reset();
        }
        catch (Exception e)
        {
            _logger.LogError("{0}{1}{2}", e.Message, Environment.NewLine, e.StackTrace);
        }
        return Clients.All.Update(JsonSerializer.Serialize(DataHost.Data));
    }

    public Task SwapPlayers()
    {
        try
        {
            _methods.SwitchPlayers();
        }
        catch (Exception e)
        {
            _logger.LogError("{0}{1}{2}", e.Message, Environment.NewLine, e.StackTrace);
        }
        return Clients.All.Update(JsonSerializer.Serialize(DataHost.Data));
    }

    public Task SwapNames()
    {
        try
        {
            _methods.SwitchPlayerNames();
        }
        catch (Exception e)
        {
            _logger.LogError("{0}{1}{2}", e.Message, Environment.NewLine, e.StackTrace);
        }
        return Clients.All.Update(JsonSerializer.Serialize(DataHost.Data));
    }

    public Task SwapCountry()
    {
        try
        {
            _methods.SwitchPlayerCountryes();
        }
        catch (Exception e)
        {
            _logger.LogError("{0}{1}{2}", e.Message, Environment.NewLine, e.StackTrace);
        }
        return Clients.All.Update(JsonSerializer.Serialize(DataHost.Data));
    }

    public Task Update(string content)
    {
        try
        {
            DataHost.Data = JsonSerializer.Deserialize<MainModel>(content);
        }
        catch (Exception e)
        {
            _logger.LogError("{0}{1}{2}", e.Message, Environment.NewLine, e.StackTrace);
        }
        return Clients.Others.Update(JsonSerializer.Serialize(DataHost.Data));
    }

    public Task GetOnStartup(string content)
    {
        return Clients.Caller.GetOnStartup(JsonSerializer.Serialize(DataHost.Data));
    } 
}