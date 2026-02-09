using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Controllers;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class FontsControllerTests
{
    [Fact]
    public async Task GetFont_ExistingFont_ReturnsFile()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

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

        var result = await controller.GetFont("TestFont");

        var fileResult = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("font/ttf", fileResult.ContentType);
        Assert.Equal("TestFont.ttf", fileResult.FileDownloadName);
    }

    [Fact]
    public async Task GetFont_NonExistent_ReturnsNotFound()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var result = await controller.GetFont("NonExistent");

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Font not found: NonExistent", notFoundResult.Value);
    }

    [Fact]
    public async Task GetAllFonts_ReturnsAllFontsMetadata()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var file1 = TestHelpers.CreateFormFile("Font1.ttf", [1, 2, 3], "font/ttf");
        var file2 = TestHelpers.CreateFormFile("Font2.woff", [4, 5, 6], "font/woff");

        await service.UploadFont(
            new FontFile
            {
                FontName = "Font1",
                FileName = "Font1.ttf",
                IsShouldExists = true,
                File = file1,
            }
        );
        await service.UploadFont(
            new FontFile
            {
                FontName = "Font2",
                FileName = "Font2.woff",
                IsShouldExists = true,
                File = file2,
            }
        );

        var result = await controller.GetAllFonts();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var fonts = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
        Assert.Equal(2, fonts.Count());
    }

    [Fact]
    public async Task UploadFont_ValidFont_ReturnsOk()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var file = TestHelpers.CreateFormFile("NewFont.ttf", [1, 2, 3, 4], "font/ttf");

        var result = await controller.UploadFont("NewFont", file);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task UploadFont_EmptyFontName_ReturnsBadRequest()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var file = TestHelpers.CreateFormFile("Font.ttf", [1, 2, 3], "font/ttf");

        var result = await controller.UploadFont("", file);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Font name is required", badRequestResult.Value);
    }

    [Fact]
    public async Task UploadFont_NullFile_ReturnsBadRequest()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var result = await controller.UploadFont("FontName", null!);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Font file is required", badRequestResult.Value);
    }

    [Fact]
    public async Task UploadFont_InvalidExtension_ReturnsBadRequest()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var file = TestHelpers.CreateFormFile("invalid.txt", [1, 2, 3], "text/plain");

        var result = await controller.UploadFont("InvalidFont", file);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Invalid font file extension", badRequestResult.Value?.ToString());
    }

    [Fact]
    public async Task DeleteFont_ExistingFont_ReturnsOk()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var file = TestHelpers.CreateFormFile("ToDelete.ttf", [1, 2, 3], "font/ttf");
        await service.UploadFont(
            new FontFile
            {
                FontName = "ToDelete",
                FileName = "ToDelete.ttf",
                IsShouldExists = true,
                File = file,
            }
        );

        var result = await controller.DeleteFont("ToDelete");

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var fonts = await service.GetAllFonts();
        Assert.Empty(fonts);
    }

    [Fact]
    public async Task DeleteFont_EmptyFontName_ReturnsBadRequest()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new FontsService(
            environment,
            NullLogger<FontsService>.Instance,
            databaseService
        );
        var controller = new FontsController(service, NullLogger<FontsController>.Instance);

        var result = await controller.DeleteFont("");

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Font name is required", badRequestResult.Value);
    }
}
