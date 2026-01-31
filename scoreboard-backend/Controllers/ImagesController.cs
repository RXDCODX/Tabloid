using Microsoft.AspNetCore.Mvc;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController(
    BackgroundImagesService backgroundImagesService,
    ILogger<ImagesController> logger
) : ControllerBase
{
    /// <summary>
    /// Get a background image by type
    /// </summary>
    /// <param name="imageType">Image type (e.g., Background1, Background2, etc.)</param>
    /// <returns>Image file with appropriate content type</returns>
    [HttpGet("{imageType}")]
    public async Task<IActionResult> GetImage(string imageType)
    {
        try
        {
            logger.LogInformation("Requested image: {ImageType}", imageType);

            if (!Enum.TryParse<ImageType>(imageType, true, out var parsedImageType))
            {
                logger.LogWarning("Invalid image type requested: {ImageType}", imageType);
                return BadRequest($"Invalid image type: {imageType}");
            }

            var images = await backgroundImagesService.GetAllImages();
            var image = images.FirstOrDefault(i => i.ImageType == parsedImageType);

            if (image?.File == null)
            {
                logger.LogWarning("Image not found for type: {ImageType}", imageType);
                return NotFound($"Image not found for type: {imageType}");
            }

            // Read file data from memory stream
            var fileStream = image.File.OpenReadStream();
            var fileName = image.ImageName;
            var contentType = image.File.ContentType ?? "application/octet-stream";

            logger.LogInformation(
                "Returning image {ImageType} with name {FileName} and type {ContentType}",
                imageType,
                fileName,
                contentType
            );

            return File(fileStream, contentType, fileName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving image for type {ImageType}", imageType);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get all available background images
    /// </summary>
    /// <returns>List of background images metadata</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllImages()
    {
        try
        {
            logger.LogInformation("GetAllImages request");

            var images = await backgroundImagesService.GetAllImages();

            var result = images
                .Select(img => new
                {
                    imageType = img.ImageType.ToString(),
                    imageName = img.ImageName,
                    contentType = img.File?.ContentType,
                    uploadedAt = img.UploadedAt,
                    fileSize = img.File?.Length ?? 0,
                })
                .ToList();

            logger.LogInformation("Returning {Count} images", result.Count);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving all images");
            return StatusCode(500, "Internal server error");
        }
    }
}
