using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class ColorPresetServiceTests
{
    [Fact]
    public void InitializesDefaultPresets_WhenDatabaseEmpty()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var service = new ColorPresetService(NullLogger<ColorPresetService>.Instance, databaseService);

        var presets = service.GetAll();

        Assert.NotEmpty(presets);
        Assert.Contains(presets, p => p.Name == "Default");
    }

    [Fact]
    public void Upsert_UpdatesExistingPreset()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var service = new ColorPresetService(NullLogger<ColorPresetService>.Instance, databaseService);

        service.Upsert(new ColorPresetModel { Name = "Test", ScoreColor = "#111111" });
        service.Upsert(new ColorPresetModel { Name = "Test", ScoreColor = "#222222" });

        var preset = service.GetAll().First(p => p.Name == "Test");

        Assert.Equal("#222222", preset.ScoreColor);
    }
}
