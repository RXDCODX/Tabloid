using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Services;

namespace scoreboard_backend.Hubs;

public class ScoreboardHub(ScoreboardStateService stateService) : Hub
{
    public override Task OnConnectedAsync()
    {
        var state = stateService.GetState();
        var stateJson = state.RootElement.GetRawText();
        return Clients.Caller.SendAsync("ReceiveState", stateJson);
    }

    public async Task GetState()
    {
        var state = stateService.GetState();
        var stateJson = state.RootElement.GetRawText();
        await Clients.Caller.SendAsync("ReceiveState", stateJson);
    }

    public async Task SetState(string stateJson)
    {
        stateService.SetStateFromJson(stateJson);
        var currentState = stateService.GetState();
        var currentStateJson = currentState.RootElement.GetRawText();
        await Clients.All.SendAsync("ReceiveState", currentStateJson);
    }

    public async Task ResetToDefault()
    {
        stateService.ResetToDefault();
        var state = stateService.GetState();
        var stateJson = state.RootElement.GetRawText();
        await Clients.All.SendAsync("ReceiveState", stateJson);
    }
}
