using Microsoft.Extensions.Logging.Abstractions;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_tests;

public class BackgroundImagesServiceTests
{
    [Fact]
    public async Task UpdateAndGetAllImages_ReturnsSavedImage()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new BackgroundImagesService(
            environment,
            NullLogger<BackgroundImagesService>.Instance,
            databaseService
        );

        var file = TestHelpers.CreateFormFile("left.png", [1, 2, 3], "image/png");
        var image = new BackgroundImage
        {
            ImageName = "left.png",
            ImageType = ImageType.LeftImage,
            IsShouldExists = true,
            File = file,
            UploadedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };

        await service.UpdateBackgroundImage(image);
        var images = await service.GetAllImages();

        Assert.Single(images);
        Assert.Equal(ImageType.LeftImage, images[0].ImageType);
        Assert.Equal("left.png", images[0].ImageName);
    }

    [Fact]
    public async Task DeleteImage_RemovesFromCache()
    {
        TestHelpers.CleanupDatabase();
        var databaseService = new DatabaseService(NullLogger<DatabaseService>.Instance);
        var environment = new TestWebHostEnvironment();
        var service = new BackgroundImagesService(
            environment,
            NullLogger<BackgroundImagesService>.Instance,
            databaseService
        );

        var file = TestHelpers.CreateFormFile("left.png", [1, 2, 3], "image/png");
        await service.UpdateBackgroundImage(
            new BackgroundImage
            {
                ImageName = "left.png",
                ImageType = ImageType.LeftImage,
                IsShouldExists = true,
                File = file,
                UploadedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            }
        );

        await service.DeleteImage(ImageType.LeftImage);
        var images = await service.GetAllImages();

        Assert.Empty(images);
    }
}
