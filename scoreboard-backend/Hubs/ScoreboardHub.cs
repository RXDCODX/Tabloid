using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Hubs;

public class ScoreboardHub(
    ScoreboardStateService stateService,
    ColorPresetService colorPresetService,
    PlayerPresetService playerPresetService,
    ILogger<ScoreboardHub> logger
) : Hub
{
    public const string MainReceiveStateMethodName = "ReceiveState";

    public override async Task OnConnectedAsync()
    {
        logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await Clients.Caller.SendAsync(MainReceiveStateMethodName, stateService.GetState());
    }

    public async Task GetState()
    {
        logger.LogInformation("GetState called by {ConnectionId}", Context.ConnectionId);
        await Clients.Caller.SendAsync(MainReceiveStateMethodName, stateService.GetState());
    }

    public async Task UpdatePlayer1(Player player)
    {
        logger.LogInformation("UpdatePlayer1 called by {ConnectionId}", Context.ConnectionId);
        try
        {
            stateService.UpdatePlayer1(player);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdatePlayer1");
            throw;
        }
    }

    public async Task UpdatePlayer2(Player player)
    {
        logger.LogInformation("UpdatePlayer2 called by {ConnectionId}", Context.ConnectionId);
        try
        {
            stateService.UpdatePlayer2(player);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdatePlayer2");
            throw;
        }
    }

    public async Task UpdateMeta(MetaInfo meta)
    {
        logger.LogInformation("UpdateMeta called by {ConnectionId}", Context.ConnectionId);
        try
        {
            stateService.UpdateMeta(meta);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdateMeta");
            throw;
        }
    }

    public async Task UpdateColors(ColorPreset colors)
    {
        logger.LogInformation("UpdateColors called by {ConnectionId}", Context.ConnectionId);
        try
        {
            stateService.UpdateColors(colors);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdateColors");
            throw;
        }
    }

    public async Task UpdateVisibility(bool isVisible)
    {
        logger.LogInformation(
            "UpdateVisibility called by {ConnectionId}: {IsVisible}",
            Context.ConnectionId,
            isVisible
        );
        try
        {
            stateService.UpdateVisibility(isVisible);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdateVisibility");
            throw;
        }
    }

    public async Task UpdateAnimationDuration(int animationDuration)
    {
        logger.LogInformation(
            "UpdateAnimationDuration called by {ConnectionId}: {Duration}",
            Context.ConnectionId,
            animationDuration
        );
        try
        {
            stateService.UpdateAnimationDuration(animationDuration);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdateAnimationDuration");
            throw;
        }
    }

    public async Task UpdateLayoutConfig(LayoutConfig config)
    {
        logger.LogInformation("UpdateLayoutConfig called by {ConnectionId}", Context.ConnectionId);
        try
        {
            stateService.UpdateLayoutConfig(config);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdateLayoutConfig");
            throw;
        }
    }

    public async Task UpdateBordersShowingState(bool isShowBorders)
    {
        logger.LogInformation(
            "UpdateBordersShowingState called by {ConnectionId}: {IsShow}",
            Context.ConnectionId,
            isShowBorders
        );
        try
        {
            stateService.UpdateShowBorders(isShowBorders);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpdateBordersShowingState");
            throw;
        }
    }

    public async Task SetState(ScoreboardState state)
    {
        logger.LogInformation("SetState called by {ConnectionId}", Context.ConnectionId);
        try
        {
            stateService.SetState(state);
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in SetState");
            throw;
        }
    }

    public async Task ResetToDefault()
    {
        logger.LogInformation("ResetToDefault called by {ConnectionId}", Context.ConnectionId);
        try
        {
            stateService.ResetToDefault();
            await Clients.All.SendAsync(MainReceiveStateMethodName, stateService.GetState());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in ResetToDefault");
            throw;
        }
    }

    public async Task GetColorPresets()
    {
        logger.LogInformation("GetColorPresets called by {ConnectionId}", Context.ConnectionId);
        try
        {
            var presets = colorPresetService.GetAll();
            logger.LogInformation("Sending {Count} color presets", presets.Count);
            await Clients.Caller.SendAsync("ReceiveColorPresets", presets);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in GetColorPresets");
        }
    }

    public async Task ApplyColorPreset(string presetName)
    {
        logger.LogInformation(
            "ApplyColorPreset called by {ConnectionId}: {Preset}",
            Context.ConnectionId,
            presetName
        );
        try
        {
            var presets = colorPresetService.GetAll();
            var preset = presets.FirstOrDefault(p =>
                p.Name.Equals(presetName, StringComparison.OrdinalIgnoreCase)
            );

            if (preset != null)
            {
                var currentColors = stateService.GetState().Colors;

                if (!string.IsNullOrEmpty(preset.PlayerNamesColor))
                {
                    currentColors.PlayerNamesColor = preset.PlayerNamesColor;
                }

                if (!string.IsNullOrEmpty(preset.TournamentTitleColor))
                {
                    currentColors.TournamentTitleColor = preset.TournamentTitleColor;
                }

                if (!string.IsNullOrEmpty(preset.FightModeColor))
                {
                    currentColors.FightModeColor = preset.FightModeColor;
                }

                if (!string.IsNullOrEmpty(preset.ScoreColor))
                {
                    currentColors.ScoreColor = preset.ScoreColor;
                }

                stateService.UpdateColors(currentColors);
                await Clients.All.SendAsync("ReceiveState", stateService.GetState());
            }
            else
            {
                logger.LogWarning("ApplyColorPreset: preset not found {Preset}", presetName);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in ApplyColorPreset");
            throw;
        }
    }

    public async Task GetPlayerPresets(int count = -1, string? startsWith = null)
    {
        logger.LogInformation("GetPlayerPresets called by {ConnectionId}", Context.ConnectionId);
        try
        {
            var presets = playerPresetService.GetAll(count, startsWith);
            await Clients.Caller.SendAsync("ReceivePlayerPresets", presets);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in GetPlayerPresets");
        }
    }

    // Upsert preset for player 1 or 2 by taking player data from current state
    public async Task UpsertPlayerPreset(int playerNumber)
    {
        logger.LogInformation(
            "UpsertPlayerPreset called by {ConnectionId}: Player{Player}",
            Context.ConnectionId,
            playerNumber
        );
        try
        {
            var state = stateService.GetState();
            var source = playerNumber switch
            {
                1 => state.Player1,
                2 => state.Player2,
                _ => null,
            };

            if (source is null)
            {
                logger.LogWarning(
                    "UpsertPlayerPreset: invalid player number {Player}",
                    playerNumber
                );
                return;
            }

            var preset = new PlayerPreset
            {
                Name = source.Name,
                Score = source.Score,
                Tag = source.Tag,
                Final = source.Final,
                Flag = source.Flag,
            };

            playerPresetService.Upsert(preset);

            // Notify all clients about updated presets list
            var presets = playerPresetService.GetAll();
            await Clients.All.SendAsync("ReceivePlayerPresets", presets);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in UpsertPlayerPreset");
            throw;
        }
    }

    // Delete preset for player 1 or 2 by removing preset with the player's current name from state
    public async Task DeletePlayerPreset(int playerNumber)
    {
        logger.LogInformation(
            "DeletePlayerPreset called by {ConnectionId}: Player{Player}",
            Context.ConnectionId,
            playerNumber
        );
        try
        {
            var state = stateService.GetState();
            var name =
                playerNumber == 1 ? state.Player1?.Name
                : playerNumber == 2 ? state.Player2?.Name
                : null;

            if (string.IsNullOrWhiteSpace(name))
            {
                logger.LogWarning(
                    "DeletePlayerPreset: no name found for player {Player}",
                    playerNumber
                );
                return;
            }

            playerPresetService.RemoveByName(name);
            var presets = playerPresetService.GetAll();
            await Clients.All.SendAsync("ReceivePlayerPresets", presets);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in DeletePlayerPreset");
            throw;
        }
    }
}
