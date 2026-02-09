using Microsoft.AspNetCore.Mvc;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FontsController(FontsService fontsService, ILogger<FontsController> logger)
    : ControllerBase
{
    /// <summary>
    /// Get a font file by name
    /// </summary>
    /// <param name="fontName">Font name (unique identifier)</param>
    /// <returns>Font file with appropriate content type</returns>
    [HttpGet("{fontName}")]
    public async Task<IActionResult> GetFont(string fontName)
    {
        try
        {
            logger.LogInformation("Requested font: {FontName}", fontName);

            var font = await fontsService.GetFontByName(fontName);

            if (font?.File == null)
            {
                logger.LogWarning("Font not found: {FontName}", fontName);
                return NotFound($"Font not found: {fontName}");
            }

            // Read file data from memory stream
            var fileStream = font.File.OpenReadStream();
            var fileName = font.FileName;
            var contentType = font.File.ContentType;

            logger.LogInformation(
                "Returning font {FontName} with file name {FileName} and type {ContentType}",
                fontName,
                fileName,
                contentType
            );

            return File(fileStream, contentType, fileName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving font {FontName}", fontName);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get all available fonts
    /// </summary>
    /// <returns>List of fonts metadata</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllFonts()
    {
        try
        {
            logger.LogInformation("GetAllFonts request");

            var fonts = await fontsService.GetAllFonts();

            var result = fonts
                .Select(font => new
                {
                    fontName = font.FontName,
                    fileName = font.FileName,
                    contentType = font.File?.ContentType,
                    uploadedAt = font.UploadedAt,
                    fileSize = font.File?.Length ?? 0,
                })
                .ToList();

            logger.LogInformation("Returning {Count} fonts", result.Count);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving all fonts");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Upload a new font or update an existing one
    /// </summary>
    /// <param name="fontName">Font name (unique identifier)</param>
    /// <param name="file">Font file</param>
    /// <returns>Success status</returns>
    [HttpPost]
    public async Task<IActionResult> UploadFont(
        [FromForm] string fontName,
        [FromForm] IFormFile file
    )
    {
        try
        {
            logger.LogInformation(
                "UploadFont request for {FontName}, file: {FileName}",
                fontName,
                file?.FileName
            );

            if (string.IsNullOrWhiteSpace(fontName))
            {
                logger.LogWarning("Font name is required");
                return BadRequest("Font name is required");
            }

            if (file == null || file.Length == 0)
            {
                logger.LogWarning("Font file is required");
                return BadRequest("Font file is required");
            }

            var fontFile = new FontFile
            {
                FontName = fontName,
                FileName = file.FileName,
                File = file,
                IsShouldExists = true,
            };

            await fontsService.UploadFont(fontFile);

            logger.LogInformation("Font uploaded successfully: {FontName}", fontName);
            return Ok(new { message = "Font uploaded successfully", fontName });
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Invalid font upload request");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading font");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a font
    /// </summary>
    /// <param name="fontName">Font name to delete</param>
    /// <returns>Success status</returns>
    [HttpDelete("{fontName}")]
    public async Task<IActionResult> DeleteFont(string fontName)
    {
        try
        {
            logger.LogInformation("DeleteFont request for {FontName}", fontName);

            if (string.IsNullOrWhiteSpace(fontName))
            {
                logger.LogWarning("Font name is required");
                return BadRequest("Font name is required");
            }

            await fontsService.DeleteFont(fontName);

            logger.LogInformation("Font deleted successfully: {FontName}", fontName);
            return Ok(new { message = "Font deleted successfully", fontName });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting font {FontName}", fontName);
            return StatusCode(500, "Internal server error");
        }
    }
}
