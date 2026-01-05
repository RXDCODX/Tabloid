using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Services;

namespace scoreboard_backend.Hubs;

public class ScoreboardHub(ScoreboardStateService stateService) : Hub
{
    public override Task OnConnectedAsync()
    {
        var state = stateService.GetState();
        return Clients.Caller.SendAsync("ReceiveState", state);
    }

    public async Task GetState()
    {
        var state = stateService.GetState();
        await Clients.Caller.SendAsync("ReceiveState", state);
    }

    public async Task SetState(string stateJson)
    {
        stateService.SetStateFromJson(stateJson);
        var currentState = stateService.GetState();
        await Clients.All.SendAsync("ReceiveState", currentState);
    }

    public async Task ResetToDefault()
    {
        stateService.ResetToDefault();
        var state = stateService.GetState();
        await Clients.All.SendAsync("ReceiveState", state);
    }
}
