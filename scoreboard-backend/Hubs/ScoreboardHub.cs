using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Hubs;

public class ScoreboardHub(ScoreboardStateService stateService) : Hub
{
    public override Task OnConnectedAsync()
    {
        return Clients.Caller.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task GetState()
    {
        await Clients.Caller.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task UpdatePlayer1(Player player)
    {
        stateService.UpdatePlayer1(player);
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task UpdatePlayer2(Player player)
    {
        stateService.UpdatePlayer2(player);
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task UpdateMeta(MetaInfo meta)
    {
        stateService.UpdateMeta(meta);
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task UpdateColors(ColorPreset colors)
    {
        stateService.UpdateColors(colors);
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task UpdateVisibility(bool isVisible)
    {
        stateService.UpdateVisibility(isVisible);
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task UpdateAnimationDuration(int animationDuration)
    {
        stateService.UpdateAnimationDuration(animationDuration);
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task SetState(ScoreboardState state)
    {
        stateService.SetState(state);
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }

    public async Task ResetToDefault()
    {
        stateService.ResetToDefault();
        await Clients.All.SendAsync("ReceiveState", stateService.GetState());
    }
}
