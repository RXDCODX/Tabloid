using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class ScoreboardStateServiceTests
{
    [Fact]
    public void UpdatePlayer1_UpdatesState()
    {
        TestHelpers.CleanupDatabase();
        Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", "true");
        try
        {
            var backgroundImagesService = TestHelpers.CreateBackgroundImagesService();
            var databaseService = TestHelpers.CreateDatabaseService();
            var service = new ScoreboardStateService(
                backgroundImagesService,
                NullLogger<ScoreboardStateService>.Instance,
                databaseService
            );

            var player = new Player
            {
                Name = "Player 1",
                Score = 2,
                Tag = "A",
            };
            service.UpdatePlayer1(player);

            var state = service.GetState();
            Assert.Equal("Player 1", state.Player1.Name);
            Assert.Equal(2, state.Player1.Score);
            Assert.Equal("A", state.Player1.Tag);
        }
        finally
        {
            Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", null);
        }
    }

    [Fact]
    public void ResetToDefault_ResetsState()
    {
        TestHelpers.CleanupDatabase();
        Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", "true");
        try
        {
            var backgroundImagesService = TestHelpers.CreateBackgroundImagesService();
            var databaseService = TestHelpers.CreateDatabaseService();
            var service = new ScoreboardStateService(
                backgroundImagesService,
                NullLogger<ScoreboardStateService>.Instance,
                databaseService
            );

            service.UpdateVisibility(false);
            service.ResetToDefault();

            var state = service.GetState();
            Assert.True(state.IsVisible);
        }
        finally
        {
            Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", null);
        }
    }

    [Fact]
    public void FontConfiguration_IsInitialized()
    {
        TestHelpers.CleanupDatabase();
        Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", "true");
        try
        {
            var backgroundImagesService = TestHelpers.CreateBackgroundImagesService();
            var databaseService = TestHelpers.CreateDatabaseService();
            var service = new ScoreboardStateService(
                backgroundImagesService,
                NullLogger<ScoreboardStateService>.Instance,
                databaseService
            );

            var state = service.GetState();

            Assert.NotNull(state.FontConfig);
            Assert.Equal(string.Empty, state.FontConfig.PlayerNameFont);
            Assert.Equal(string.Empty, state.FontConfig.PlayerTagFont);
            Assert.Equal(string.Empty, state.FontConfig.ScoreFont);
            Assert.Equal(string.Empty, state.FontConfig.TournamentTitleFont);
            Assert.Equal(string.Empty, state.FontConfig.FightModeFont);
        }
        finally
        {
            Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", null);
        }
    }
}
