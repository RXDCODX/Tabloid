using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class BackgroundImagesService
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private readonly string _imagesFolder;

    public BackgroundImagesService(IWebHostEnvironment environment)
    {
        _imagesFolder = Path.Combine(environment.WebRootPath, "Images");

        EnsureImagesFolderExists();
    }

    public async Task UpdateBackgroundImage(BackgroundImage image)
    {
        ArgumentNullException.ThrowIfNull(image);

        if (!image.IsShouldExists)
        {
            await _semaphore.WaitAsync();
            try
            {
                var files = Directory.GetFiles(_imagesFolder);
                var targetName = image.ImageType.ToString();

                foreach (var filePath in files)
                {
                    var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(filePath);
                    if (
                        fileNameWithoutExtension.Equals(
                            targetName,
                            StringComparison.OrdinalIgnoreCase
                        )
                    )
                    {
                        File.Delete(filePath);
                    }
                }
            }
            finally
            {
                _semaphore.Release();
            }

            return;
        }

        ArgumentNullException.ThrowIfNull(image.File);

        await _semaphore.WaitAsync();
        try
        {
            var sanitizedFileName = Path.GetFileName(image.ImageName);
            if (string.IsNullOrWhiteSpace(sanitizedFileName))
            {
                throw new ArgumentException("Invalid image name", nameof(image));
            }

            var filePath = Path.Combine(_imagesFolder, sanitizedFileName);
            var fullPath = Path.GetFullPath(filePath);
            var folderFullPath = Path.GetFullPath(_imagesFolder);
            if (!fullPath.StartsWith(folderFullPath, StringComparison.OrdinalIgnoreCase))
            {
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
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<List<BackgroundImage>> GetAllImages()
    {
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
                    continue;
                }

                var fileName = Path.GetFileName(filePath);

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
                    }
                );
            }

            return fileList;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task ClearAllImages()
    {
        await _semaphore.WaitAsync();
        try
        {
            foreach (var file in Directory.GetFiles(_imagesFolder))
            {
                File.Delete(file);
            }
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private void EnsureImagesFolderExists()
    {
        Directory.CreateDirectory(_imagesFolder);
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
            _ => "application/octet-stream",
        };
    }
}
