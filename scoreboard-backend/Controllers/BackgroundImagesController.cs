using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Hubs;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackgroundImagesController(
    ScoreboardStateService stateService,
    IHubContext<ScoreboardHub> hubContext,
    IWebHostEnvironment environment
) : ControllerBase
{
    private readonly string _wwwRootPath = environment.WebRootPath;
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    [HttpPost("upload/{imageType}")]
    public async Task<IActionResult> UploadImage(string imageType, IFormFile? file)
    {
        if (!IsValidImageType(imageType))
        {
            return BadRequest(
                "Недопустимый тип изображения. Доступные типы: centerImage, leftImage, rightImage, fightModeImage"
            );
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("Файл не выбран");
        }

        // Проверяем тип файла
        if (!file.ContentType.StartsWith("image/"))
        {
            return BadRequest("Выбранный файл не является изображением");
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            return BadRequest("Не удалось определить расширение файла");
        }

        extension = extension.ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(
                $"Недопустимое расширение. Используйте: {string.Join(", ", AllowedExtensions)}"
            );
        }

        try
        {
            var backgroundImagesDir = Path.Combine(_wwwRootPath, "background-images");
            if (!Directory.Exists(backgroundImagesDir))
            {
                Directory.CreateDirectory(backgroundImagesDir);
            }

            // Удаляем все существующие файлы для этого типа (и по сохраненному пути и по маске)
            DeletePhysicalFile(GetCurrentImagePath(imageType));
            DeleteFilesForImageType(imageType, backgroundImagesDir);

            var fileName = $"{imageType}{extension}";
            var filePath = Path.Combine(backgroundImagesDir, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePathBase = $"/background-images/{fileName}";
            var cacheBuster = $"?v={Guid.NewGuid():N}";
            var relativePath = $"{relativePathBase}{cacheBuster}";
            await UpdateBackgroundImageInState(imageType, relativePath);

            return Ok(new { imagePath = relativePath, message = "Изображение успешно загружено" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при загрузке изображения: {ex.Message}");
        }
    }

    [HttpDelete("{imageType}")]
    public async Task<IActionResult> DeleteImage(string imageType)
    {
        if (!IsValidImageType(imageType))
        {
            return BadRequest("Недопустимый тип изображения");
        }

        try
        {
            var currentImagePath = GetCurrentImagePath(imageType);

            DeletePhysicalFile(currentImagePath);
            var backgroundImagesDir = Path.Combine(_wwwRootPath, "background-images");
            DeleteFilesForImageType(imageType, backgroundImagesDir);

            await UpdateBackgroundImageInState(imageType, null);

            return Ok(new { message = "Изображение успешно удалено" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при удалении изображения: {ex.Message}");
        }
    }

    [HttpGet("list")]
    public IActionResult GetBackgroundImages()
    {
        try
        {
            var state = stateService.GetState();
            var backgroundImages = state.RootElement.GetProperty("backgroundImages");

            var result = new Dictionary<string, string?>();
            foreach (
                var imageType in new[]
                {
                    "centerImage",
                    "leftImage",
                    "rightImage",
                    "fightModeImage",
                }
            )
            {
                if (backgroundImages.TryGetProperty(imageType, out var imageElement))
                {
                    result[imageType] = imageElement.GetString();
                }
                else
                {
                    result[imageType] = null;
                }
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при получении списка изображений: {ex.Message}");
        }
    }

    private static bool IsValidImageType(string imageType)
    {
        var validTypes = new[] { "centerImage", "leftImage", "rightImage", "fightModeImage" };
        return validTypes.Contains(imageType);
    }

    private string? GetCurrentImagePath(string imageType)
    {
        var state = stateService.GetState();
        if (!state.RootElement.TryGetProperty("backgroundImages", out var backgroundImages))
        {
            return null;
        }

        return backgroundImages.TryGetProperty(imageType, out var imageElement)
            ? imageElement.GetString()
            : null;
    }

    private void DeletePhysicalFile(string? imagePath)
    {
        if (string.IsNullOrWhiteSpace(imagePath))
        {
            return;
        }

        var cleanPath = imagePath.Split('?', 2)[0];

        if (!cleanPath.StartsWith("/background-images/", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var filePath = Path.Combine(
            _wwwRootPath,
            cleanPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
        );

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }
    }

    private void DeleteFilesForImageType(string imageType, string backgroundImagesDir)
    {
        if (!Directory.Exists(backgroundImagesDir))
        {
            return;
        }

        var searchPatterns = new[] { $"{imageType}_*", $"{imageType}.*" };

        foreach (var pattern in searchPatterns)
        {
            foreach (var file in Directory.GetFiles(backgroundImagesDir, pattern))
            {
                System.IO.File.Delete(file);
            }
        }
    }

    private async Task UpdateBackgroundImageInState(string imageType, string? imagePath)
    {
        var state = stateService.GetState();
        var stateJson = state.RootElement.GetRawText();
        var stateObj = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
            stateJson
        );

        if (stateObj == null)
        {
            throw new InvalidOperationException("Не удалось десериализовать состояние");
        }

        // Обновляем backgroundImages
        if (!stateObj.ContainsKey("backgroundImages") || stateObj["backgroundImages"] == null)
        {
            stateObj["backgroundImages"] = new Dictionary<string, object>();
        }

        var backgroundImages = stateObj["backgroundImages"] as Dictionary<string, object>;
        if (backgroundImages == null)
        {
            backgroundImages = new Dictionary<string, object>();
            stateObj["backgroundImages"] = backgroundImages;
        }

        if (imagePath == null)
        {
            backgroundImages.Remove(imageType);
        }
        else
        {
            backgroundImages[imageType] = imagePath;
        }

        // Обновляем состояние
        var newStateJson = System.Text.Json.JsonSerializer.Serialize(stateObj);
        stateService.SetStateFromJson(newStateJson);

        // Отправляем обновление через SignalR
        await hubContext.Clients.All.SendAsync("ReceiveState", newStateJson);
    }
}
