using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Controllers;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class ControllersTests
{
    [Fact]
    public async Task ImagesController_InvalidType_ReturnsBadRequest()
    {
        TestHelpers.CleanupDatabase();
        var service = TestHelpers.CreateBackgroundImagesService();
        var controller = new ImagesController(service, NullLogger<ImagesController>.Instance);

        var result = await controller.GetImage("not-a-type");

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task ImagesController_NotFound_ReturnsNotFound()
    {
        TestHelpers.CleanupDatabase();
        var service = TestHelpers.CreateBackgroundImagesService();
        var controller = new ImagesController(service, NullLogger<ImagesController>.Instance);

        var result = await controller.GetImage(ImageType.LeftImage.ToString());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public void ColorPresetsController_GetAll_ReturnsOk()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var service = new ColorPresetService(NullLogger<ColorPresetService>.Instance, databaseService);
        var controller = new ColorPresetsController(service);

        var result = controller.GetAll();

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task BackgroundImagesController_NoFile_ReturnsBadRequest()
    {
        TestHelpers.CleanupDatabase();
        Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", "true");
        try
        {
            var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
            var backgroundImagesService = new BackgroundImagesService(
                new TestWebHostEnvironment(),
                NullLogger<BackgroundImagesService>.Instance,
                databaseService
            );
            var stateService = new ScoreboardStateService(
                backgroundImagesService,
                NullLogger<ScoreboardStateService>.Instance,
                databaseService
            );

            var controller = new BackgroundImagesController(
                stateService,
                backgroundImagesService,
                new TestHubContext()
            );

            var result = await controller.UpdateBackgroundImage(ImageType.LeftImage, null);

            Assert.IsType<BadRequestObjectResult>(result);
        }
        finally
        {
            Environment.SetEnvironmentVariable("SCOREBOARD_DISABLE_PERSISTENCE", null);
        }
    }

    [Fact]
    public void SponsorController_FilePresent_ReturnsTrue()
    {
        var controller = new SponsorController();
        var filePath = Path.Combine(AppContext.BaseDirectory, "RXDCODX-test.txt");
        try
        {
            File.WriteAllText(filePath, "test");

            var result = controller.IsSponsorDisabled();
            var ok = Assert.IsType<OkObjectResult>(result.Result);

            Assert.True((bool)ok.Value!);
        }
        finally
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
}
