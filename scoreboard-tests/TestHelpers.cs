using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Services;
using scoreboard_backend.Hubs;
using scoreboard_backend.Models;
using Microsoft.Data.Sqlite;

namespace scoreboard_tests;

public static class TestHelpers
{
    public static string GetDatabasePath() =>
        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "player_presets.db");

    public static void CleanupDatabase()
    {
        var path = GetDatabasePath();
        if (!File.Exists(path))
        {
            return;
        }

        var deleted = false;
        for (var attempt = 0; attempt < 5; attempt++)
        {
            try
            {
                File.Delete(path);
                deleted = true;
                break;
            }
            catch (IOException) when (attempt < 4)
            {
                GC.Collect();
                GC.WaitForPendingFinalizers();
                Thread.Sleep(100);
            }
            catch (IOException)
            {
                break;
            }
        }

        if (deleted)
        {
            return;
        }

        try
        {
            using var conn = new SqliteConnection($"Data Source={path}");
            conn.Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM player_presets; DELETE FROM scoreboard_state; DELETE FROM color_presets; DELETE FROM background_images; DELETE FROM fonts;";
            cmd.ExecuteNonQuery();
        }
        catch
        {
            // ignore cleanup failures
        }
    }

    public static DatabaseService CreateDatabaseService() =>
        new(NullLogger<DatabaseService>.Instance);

    public static BackgroundImagesService CreateBackgroundImagesService()
    {
        var environment = new TestWebHostEnvironment();
        Directory.CreateDirectory(Path.Combine(environment.WebRootPath, "Images"));
        return new BackgroundImagesService(
            environment,
            NullLogger<BackgroundImagesService>.Instance,
            CreateDatabaseService()
        );
    }

    public static IFormFile CreateFormFile(string fileName, byte[] content, string contentType)
    {
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }
}

public sealed class TestWebHostEnvironment : IWebHostEnvironment
{
    public string EnvironmentName { get; set; } = "Development";
    public string ApplicationName { get; set; } = "scoreboard-tests";
    public string WebRootPath { get; set; } = Path.Combine(AppContext.BaseDirectory, "wwwroot");
    public IFileProvider WebRootFileProvider { get; set; }
    public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
    public IFileProvider ContentRootFileProvider { get; set; }

    public TestWebHostEnvironment()
    {
        Directory.CreateDirectory(WebRootPath);
        WebRootFileProvider = new PhysicalFileProvider(WebRootPath);
        ContentRootFileProvider = new PhysicalFileProvider(ContentRootPath);
    }
}

public sealed class TestHubContext : IHubContext<ScoreboardHub>
{
    public IHubClients Clients { get; } = new TestHubClients();
    public IGroupManager Groups { get; } = new TestGroupManager();
}

public sealed class TestHubClients : IHubClients
{
    public IClientProxy All => new TestClientProxy();
    public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds) => new TestClientProxy();
    public IClientProxy Caller => new TestClientProxy();
    public IClientProxy Client(string connectionId) => new TestClientProxy();
    public IClientProxy Clients(IReadOnlyList<string> connectionIds) => new TestClientProxy();
    public IClientProxy Group(string groupName) => new TestClientProxy();
    public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => new TestClientProxy();
    public IClientProxy Groups(IReadOnlyList<string> groupNames) => new TestClientProxy();
    public IClientProxy Others => new TestClientProxy();
    public IClientProxy OthersInGroup(string groupName) => new TestClientProxy();
    public IClientProxy User(string userId) => new TestClientProxy();
    public IClientProxy Users(IReadOnlyList<string> userIds) => new TestClientProxy();
}

public sealed class TestClientProxy : IClientProxy
{
    public Task SendCoreAsync(string method, object?[] args, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}

public sealed class TestGroupManager : IGroupManager
{
    public Task AddToGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;

    public Task RemoveFromGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
