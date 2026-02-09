using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class FontsServiceTests
{
    [Fact]
    public async Task UploadAndGetAllFonts_ReturnsSavedFont()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );

        var file = TestHelpers.CreateFormFile("Arial.ttf", [1, 2, 3, 4, 5], "font/ttf");
        var font = new FontFile
        {
            FontName = "Arial",
            FileName = "Arial.ttf",
            IsShouldExists = true,
            File = file,
            UploadedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };

        await service.UploadFont(font);
        var fonts = await service.GetAllFonts();

        Assert.Single(fonts);
        Assert.Equal("Arial", fonts[0].FontName);
        Assert.Equal("Arial.ttf", fonts[0].FileName);
    }

    [Fact]
    public async Task GetFontByName_ReturnsCorrectFont()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );

        var file = TestHelpers.CreateFormFile("Roboto.woff2", [1, 2, 3, 4], "font/woff2");
        await service.UploadFont(
            new FontFile
            {
                FontName = "Roboto",
                FileName = "Roboto.woff2",
                IsShouldExists = true,
                File = file,
                UploadedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            }
        );

        var font = await service.GetFontByName("Roboto");

        Assert.NotNull(font);
        Assert.Equal("Roboto", font.FontName);
        Assert.Equal("Roboto.woff2", font.FileName);
        Assert.NotNull(font.File);
    }

    [Fact]
    public async Task DeleteFont_RemovesFromCache()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );

        var file = TestHelpers.CreateFormFile("OpenSans.otf", [5, 4, 3, 2, 1], "font/otf");
        await service.UploadFont(
            new FontFile
            {
                FontName = "OpenSans",
                FileName = "OpenSans.otf",
                IsShouldExists = true,
                File = file,
                UploadedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            }
        );

        await service.DeleteFont("OpenSans");
        var fonts = await service.GetAllFonts();

        Assert.Empty(fonts);
    }

    [Fact]
    public async Task UploadFont_WithInvalidExtension_ThrowsArgumentException()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );

        var file = TestHelpers.CreateFormFile("invalid.txt", [1, 2, 3], "text/plain");
        var font = new FontFile
        {
            FontName = "InvalidFont",
            FileName = "invalid.txt",
            IsShouldExists = true,
            File = file,
        };

        await Assert.ThrowsAsync<ArgumentException>(() => service.UploadFont(font));
    }

    [Fact]
    public async Task UploadFont_WithShouldNotExist_DeletesFont()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );

        var file = TestHelpers.CreateFormFile("TestFont.ttf", [1, 2, 3], "font/ttf");
        await service.UploadFont(
            new FontFile
            {
                FontName = "TestFont",
                FileName = "TestFont.ttf",
                IsShouldExists = true,
                File = file,
            }
        );

        // Now mark it as should not exist
        await service.UploadFont(
            new FontFile
            {
                FontName = "TestFont",
                FileName = "TestFont.ttf",
                IsShouldExists = false,
                File = file,
            }
        );

        var fonts = await service.GetAllFonts();
        Assert.Empty(fonts);
    }

    [Fact]
    public async Task GetFontByName_NonExistent_ReturnsNull()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );

        var font = await service.GetFontByName("NonExistent");

        Assert.Null(font);
    }

    [Fact]
    public async Task UploadMultipleFonts_AllStoredCorrectly()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );

        var font1 = new FontFile
        {
            FontName = "Font1",
            FileName = "Font1.ttf",
            IsShouldExists = true,
            File = TestHelpers.CreateFormFile("Font1.ttf", [1, 2, 3], "font/ttf"),
        };

        var font2 = new FontFile
        {
            FontName = "Font2",
            FileName = "Font2.woff",
            IsShouldExists = true,
            File = TestHelpers.CreateFormFile("Font2.woff", [4, 5, 6], "font/woff"),
        };

        await service.UploadFont(font1);
        await service.UploadFont(font2);

        var fonts = await service.GetAllFonts();

        Assert.Equal(2, fonts.Count);
        Assert.Contains(fonts, f => f.FontName == "Font1");
        Assert.Contains(fonts, f => f.FontName == "Font2");
    }
}
