using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class PlayerPresetServiceTests
{
    [Fact]
    public void UpsertAndGetAll_ReturnsPresets()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var service = new PlayerPresetService(NullLogger<PlayerPresetService>.Instance, databaseService);

        service.Upsert(new PlayerPreset { Name = "Alice", Score = 1, Tag = "A" });
        service.Upsert(new PlayerPreset { Name = "Bob", Score = 2, Tag = "B" });

        var presets = service.GetAll();

        Assert.Equal(2, presets.Count);
        Assert.Contains(presets, p => p.Name == "Alice");
        Assert.Contains(presets, p => p.Name == "Bob");
    }

    [Fact]
    public void RemoveByName_RemovesPreset()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var service = new PlayerPresetService(NullLogger<PlayerPresetService>.Instance, databaseService);

        service.Upsert(new PlayerPreset { Name = "Alice", Score = 1, Tag = "A" });
        service.RemoveByName("Alice");

        var presets = service.GetAll();

        Assert.Empty(presets);
    }
}
