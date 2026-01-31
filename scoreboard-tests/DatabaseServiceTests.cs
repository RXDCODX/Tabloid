using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class DatabaseServiceTests
{
    [Fact]
    public void SaveAndLoadStateJson_RoundTrips()
    {
        TestHelpers.CleanupDatabase();
        var service = new DatabaseService(NullLogger<DatabaseService>.Instance);

        var json = "{\"value\":123}";
        service.SaveStateJson(json);

        var loaded = service.LoadStateJson();

        Assert.Equal(json, loaded);
    }
}
