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

    [Fact]
    public void SaveAndLoadFont_RoundTrips()
    {
        TestHelpers.CleanupDatabase();
        var service = new DatabaseService(NullLogger<DatabaseService>.Instance);

        var fontName = "TestFont";
        var fileName = "TestFont.ttf";
        var fontData = new byte[] { 1, 2, 3, 4, 5 };
        var contentType = "font/ttf";
        var uploadedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        service.SaveFont(fontName, fileName, fontData, contentType, uploadedAt);

        var fonts = service.LoadAllFonts();

        Assert.Single(fonts);
        Assert.True(fonts.ContainsKey(fontName));
        var (loadedFileName, loadedFontData, loadedContentType, loadedUploadedAt) = fonts[fontName];
        Assert.Equal(fileName, loadedFileName);
        Assert.Equal(fontData, loadedFontData);
        Assert.Equal(contentType, loadedContentType);
        Assert.Equal(uploadedAt, loadedUploadedAt);
    }

    [Fact]
    public void DeleteFont_RemovesFont()
    {
        TestHelpers.CleanupDatabase();
        var service = new DatabaseService(NullLogger<DatabaseService>.Instance);

        service.SaveFont("Font1", "Font1.ttf", [1, 2, 3], "font/ttf", DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
        service.SaveFont("Font2", "Font2.woff", [4, 5, 6], "font/woff", DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());

        service.DeleteFont("Font1");

        var fonts = service.LoadAllFonts();

        Assert.Single(fonts);
        Assert.False(fonts.ContainsKey("Font1"));
        Assert.True(fonts.ContainsKey("Font2"));
    }

    [Fact]
    public void ClearAllFonts_RemovesAllFonts()
    {
        TestHelpers.CleanupDatabase();
        var service = new DatabaseService(NullLogger<DatabaseService>.Instance);

        service.SaveFont("Font1", "Font1.ttf", [1, 2, 3], "font/ttf", DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
        service.SaveFont("Font2", "Font2.woff", [4, 5, 6], "font/woff", DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());

        service.ClearAllFonts();

        var fonts = service.LoadAllFonts();

        Assert.Empty(fonts);
    }

    [Fact]
    public void SaveFont_UpdatesExisting()
    {
        TestHelpers.CleanupDatabase();
        var service = new DatabaseService(NullLogger<DatabaseService>.Instance);

        var fontName = "TestFont";
        service.SaveFont(fontName, "Old.ttf", [1, 2, 3], "font/ttf", 1000);
        service.SaveFont(fontName, "New.ttf", [4, 5, 6, 7], "font/ttf", 2000);

        var fonts = service.LoadAllFonts();

        Assert.Single(fonts);
        var (fileName, fontData, _, uploadedAt) = fonts[fontName];
        Assert.Equal("New.ttf", fileName);
        Assert.Equal(new byte[] { 4, 5, 6, 7 }, fontData);
        Assert.Equal(2000, uploadedAt);
    }
}
