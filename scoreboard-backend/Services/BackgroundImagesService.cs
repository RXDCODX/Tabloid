using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class BackgroundImagesService
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private readonly ILogger<BackgroundImagesService> _logger;
    private readonly DatabaseService _databaseService;

    // In-memory cache: ImageType -> (ImageName, ImageData, ContentType, UploadedAt)
    private readonly Dictionary<
        string,
        (string ImageName, byte[] ImageData, string ContentType, long UploadedAt)
    > _imageCache = new();

    public BackgroundImagesService(
        IWebHostEnvironment environment,
        ILogger<BackgroundImagesService> logger,
        DatabaseService databaseService
    )
    {
        _logger = logger;
        _databaseService = databaseService;
        Path.Combine(environment.WebRootPath, "Images");

        _logger.LogInformation("BackgroundImagesService initialized with database-only storage");

        LoadCacheFromDatabase();
    }

    private void LoadCacheFromDatabase()
    {
        try
        {
            var images = _databaseService.LoadAllBackgroundImages();
            foreach (var kvp in images)
            {
                _imageCache[kvp.Key] = kvp.Value;
            }
            _logger.LogInformation(
                "Loaded {Count} background images from database into cache",
                _imageCache.Count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load background images from database");
        }
    }

    public async Task UpdateBackgroundImage(BackgroundImage image)
    {
        _logger.LogInformation(
            "UpdateBackgroundImage called for ImageType={ImageType}, ShouldExists={ShouldExists}",
            image.ImageType,
            image.IsShouldExists
        );

        ArgumentNullException.ThrowIfNull(image);

        if (!image.IsShouldExists)
        {
            await DeleteImage(image.ImageType);
            return;
        }

        ArgumentNullException.ThrowIfNull(image.File);

        await _semaphore.WaitAsync();
        try
        {
            var sanitizedFileName = Path.GetFileName(image.ImageName);
            if (string.IsNullOrWhiteSpace(sanitizedFileName))
            {
                _logger.LogWarning("Invalid image name provided: {ImageName}", image.ImageName);
                throw new ArgumentException("Invalid image name", nameof(image));
            }

            // Read file data into memory
            byte[] imageData;
            using (var memoryStream = new MemoryStream())
            {
                await image.File.CopyToAsync(memoryStream);
                imageData = memoryStream.ToArray();
            }

            var contentType = image.File.ContentType ?? GetContentType(sanitizedFileName);
            var imageTypeString = image.ImageType.ToString();
            var uploadedAt = image.UploadedAt ?? DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // Save to cache immediately
            _imageCache[imageTypeString] = (sanitizedFileName, imageData, contentType, uploadedAt);
            _logger.LogInformation(
                "Saved {ImageType} to cache, size: {Size} bytes",
                imageTypeString,
                imageData.Length
            );

            // Save to database (synchronously to ensure persistence)
            _databaseService.SaveBackgroundImage(
                imageTypeString,
                sanitizedFileName,
                imageData,
                contentType,
                uploadedAt
            );
            _logger.LogInformation(
                "Saved background image to database for type {ImageType}",
                imageTypeString
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while saving background image");
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task DeleteImage(ImageType imageType)
    {
        await _semaphore.WaitAsync();
        try
        {
            var imageTypeString = imageType.ToString();

            // Remove from cache
            _imageCache.Remove(imageTypeString);
            _logger.LogInformation("Removed {ImageType} from cache", imageTypeString);

            // Delete from database
            _databaseService.DeleteBackgroundImage(imageTypeString);
            _logger.LogInformation("Deleted {ImageType} from database", imageTypeString);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error while deleting background image type {ImageType}",
                imageType
            );
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<List<BackgroundImage>> GetAllImages()
    {
        _logger.LogInformation("GetAllImages called");
        await _semaphore.WaitAsync();
        try
        {
            var fileList = new List<BackgroundImage>();

            // Use cache to return images
            _logger.LogInformation("Returning {Count} images from cache", _imageCache.Count);

            foreach (var kvp in _imageCache)
            {
                if (!Enum.TryParse<ImageType>(kvp.Key, true, out var imageType))
                {
                    continue;
                }

                var (imageName, imageData, contentType, uploadedAt) = kvp.Value;

                var memoryStream = new MemoryStream(imageData);
                memoryStream.Position = 0;

                var formFile = new FormFile(
                    memoryStream,
                    0,
                    memoryStream.Length,
                    kvp.Key,
                    imageName
                )
                {
                    Headers = new HeaderDictionary(),
                    ContentType = contentType,
                };

                fileList.Add(
                    new BackgroundImage()
                    {
                        File = formFile,
                        ImageName = imageName,
                        ImageType = imageType,
                        UploadedAt = uploadedAt,
                    }
                );
            }

            _logger.LogInformation("GetAllImages returning {Count} images", fileList.Count);
            return fileList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while reading background images from cache");
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task ClearAllImages()
    {
        _logger.LogInformation("ClearAllImages called");
        await _semaphore.WaitAsync();
        try
        {
            // Clear cache
            _imageCache.Clear();
            _logger.LogInformation("Cleared image cache");

            // Clear database
            _databaseService.ClearAllBackgroundImages();
            _logger.LogInformation("Cleared all images from database");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while clearing background images");
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private static string GetContentType(string fileName)
    {
        var ext = Path.GetExtension(fileName)?.ToLowerInvariant();
        return ext switch
        {
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".mov" => "video/quicktime",
            _ => "application/octet-stream",
        };
    }
}
