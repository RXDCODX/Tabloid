using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class BackgroundImagesService
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private readonly string _imagesFolder;
    private readonly ILogger<BackgroundImagesService> _logger;

    public BackgroundImagesService(
        IWebHostEnvironment environment,
        ILogger<BackgroundImagesService> logger
    )
    {
        _logger = logger;
        _imagesFolder = Path.Combine(environment.WebRootPath, "Images");

        _logger.LogInformation(
            "BackgroundImagesService initialized. Images folder: {ImagesFolder}",
            _imagesFolder
        );

        EnsureImagesFolderExists();
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

            var filePath = Path.Combine(_imagesFolder, sanitizedFileName);
            var fullPath = Path.GetFullPath(filePath);
            var folderFullPath = Path.GetFullPath(_imagesFolder);
            if (!fullPath.StartsWith(folderFullPath, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogError(
                    "Invalid file path detected. FilePath={FilePath}, ImagesFolder={ImagesFolder}",
                    fullPath,
                    folderFullPath
                );
                throw new InvalidOperationException("Invalid file path");
            }

            await using var fileStream = new FileStream(
                filePath,
                FileMode.Create,
                FileAccess.Write,
                FileShare.None,
                81920,
                useAsync: true
            );

            await image.File.CopyToAsync(fileStream);
            _logger.LogInformation("Saved background image to {FilePath}", filePath);
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
            var files = Directory.GetFiles(_imagesFolder);
            var targetName = imageType.ToString();

            foreach (var filePath in files)
            {
                var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(filePath);
                if (fileNameWithoutExtension.Equals(targetName, StringComparison.OrdinalIgnoreCase))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("Deleted background image file {FilePath}", filePath);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error while deleting background images for type {ImageType}",
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

            foreach (var filePath in Directory.GetFiles(_imagesFolder))
            {
                var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(filePath);

                if (!Enum.TryParse<ImageType>(fileNameWithoutExtension, true, out var imageType))
                {
                    // skip files that don't match the ImageType enum
                    _logger.LogDebug(
                        "Skipping file that doesn't match ImageType enum: {FilePath}",
                        filePath
                    );
                    continue;
                }

                var fileName = Path.GetFileName(filePath);

                // Get file modification time
                var fileInfo = new FileInfo(filePath);
                var uploadedAt = new DateTimeOffset(fileInfo.LastWriteTimeUtc).ToUnixTimeMilliseconds();

                // Read file into memory so the returned IFormFile is usable after this method returns
                var bytes = await File.ReadAllBytesAsync(filePath);
                var memoryStream = new MemoryStream(bytes);
                memoryStream.Position = 0;

                var formFile = new FormFile(
                    memoryStream,
                    0,
                    memoryStream.Length,
                    fileNameWithoutExtension,
                    fileName
                )
                {
                    Headers = new HeaderDictionary(),
                    ContentType = GetContentType(fileName),
                };

                fileList.Add(
                    new BackgroundImage()
                    {
                        File = formFile,
                        ImageName = fileName,
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
            _logger.LogError(
                ex,
                "Error while reading background images from folder {ImagesFolder}",
                _imagesFolder
            );
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
            foreach (var file in Directory.GetFiles(_imagesFolder))
            {
                File.Delete(file);
                _logger.LogInformation("Deleted image file {File}", file);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while clearing image folder {ImagesFolder}", _imagesFolder);
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private void EnsureImagesFolderExists()
    {
        try
        {
            Directory.CreateDirectory(_imagesFolder);
            _logger.LogInformation("Ensured images folder exists: {ImagesFolder}", _imagesFolder);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to ensure images folder exists: {ImagesFolder}",
                _imagesFolder
            );
            throw;
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
