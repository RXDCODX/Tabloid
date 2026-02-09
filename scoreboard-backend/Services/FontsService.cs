using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class FontsService
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private readonly ILogger<FontsService> _logger;
    private readonly DatabaseService _databaseService;

    // In-memory cache: FontName -> (FileName, FontData, ContentType, UploadedAt)
    private readonly Dictionary<
        string,
        (string FileName, byte[] FontData, string ContentType, long UploadedAt)
    > _fontCache = new();

    public FontsService(
        IWebHostEnvironment environment,
        ILogger<FontsService> logger,
        DatabaseService databaseService
    )
    {
        _logger = logger;
        _databaseService = databaseService;

        _logger.LogInformation("FontsService initialized with database-only storage");

        LoadCacheFromDatabase();
    }

    private void LoadCacheFromDatabase()
    {
        try
        {
            var fonts = _databaseService.LoadAllFonts();
            foreach (var kvp in fonts)
            {
                _fontCache[kvp.Key] = kvp.Value;
            }
            _logger.LogInformation(
                "Loaded {Count} fonts from database into cache",
                _fontCache.Count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load fonts from database");
        }
    }

    public async Task UploadFont(FontFile font)
    {
        _logger.LogInformation(
            "UploadFont called for FontName={FontName}, ShouldExists={ShouldExists}",
            font.FontName,
            font.IsShouldExists
        );

        ArgumentNullException.ThrowIfNull(font);

        if (!font.IsShouldExists)
        {
            await DeleteFont(font.FontName);
            return;
        }

        ArgumentNullException.ThrowIfNull(font.File);

        await _semaphore.WaitAsync();
        try
        {
            var sanitizedFileName = Path.GetFileName(font.FileName);
            if (string.IsNullOrWhiteSpace(sanitizedFileName))
            {
                _logger.LogWarning("Invalid font file name provided: {FileName}", font.FileName);
                throw new ArgumentException("Invalid font file name", nameof(font));
            }

            // Validate font file extension
            var extension = Path.GetExtension(sanitizedFileName).ToLowerInvariant();
            var allowedExtensions = new[]
            {
                ".ttf",
                ".otf",
                ".woff",
                ".woff2",
                ".eot",
            };

            if (!allowedExtensions.Contains(extension))
            {
                _logger.LogWarning(
                    "Invalid font file extension: {Extension}. Allowed: {Allowed}",
                    extension,
                    string.Join(", ", allowedExtensions)
                );
                throw new ArgumentException(
                    $"Invalid font file extension. Allowed extensions: {string.Join(", ", allowedExtensions)}",
                    nameof(font)
                );
            }

            // Read file data into memory
            byte[] fontData;
            using (var memoryStream = new MemoryStream())
            {
                await font.File.CopyToAsync(memoryStream);
                fontData = memoryStream.ToArray();
            }

            var contentType = font.File.ContentType ?? GetContentType(sanitizedFileName);
            var uploadedAt = font.UploadedAt ?? DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // Save to cache immediately
            _fontCache[font.FontName] = (sanitizedFileName, fontData, contentType, uploadedAt);
            _logger.LogInformation(
                "Saved font {FontName} to cache, size: {Size} bytes",
                font.FontName,
                fontData.Length
            );

            // Save to database (synchronously to ensure persistence)
            _databaseService.SaveFont(
                font.FontName,
                sanitizedFileName,
                fontData,
                contentType,
                uploadedAt
            );
            _logger.LogInformation("Saved font to database: {FontName}", font.FontName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while saving font");
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task DeleteFont(string fontName)
    {
        await _semaphore.WaitAsync();
        try
        {
            // Remove from cache
            _fontCache.Remove(fontName);
            _logger.LogInformation("Removed font {FontName} from cache", fontName);

            // Delete from database
            _databaseService.DeleteFont(fontName);
            _logger.LogInformation("Deleted font {FontName} from database", fontName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while deleting font {FontName}", fontName);
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<List<FontFile>> GetAllFonts()
    {
        _logger.LogInformation("GetAllFonts called");
        await _semaphore.WaitAsync();
        try
        {
            var fontList = new List<FontFile>();

            // Use cache to return fonts
            _logger.LogInformation("Returning {Count} fonts from cache", _fontCache.Count);

            foreach (var kvp in _fontCache)
            {
                var (fileName, fontData, contentType, uploadedAt) = kvp.Value;

                var memoryStream = new MemoryStream(fontData);
                memoryStream.Position = 0;

                var formFile = new FormFile(memoryStream, 0, memoryStream.Length, kvp.Key, fileName)
                {
                    Headers = new HeaderDictionary(),
                    ContentType = contentType,
                };

                fontList.Add(
                    new FontFile()
                    {
                        File = formFile,
                        FontName = kvp.Key,
                        FileName = fileName,
                        UploadedAt = uploadedAt,
                    }
                );
            }

            _logger.LogInformation("GetAllFonts returning {Count} fonts", fontList.Count);
            return fontList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all fonts");
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<FontFile?> GetFontByName(string fontName)
    {
        _logger.LogInformation("GetFontByName called for {FontName}", fontName);
        await _semaphore.WaitAsync();
        try
        {
            if (!_fontCache.TryGetValue(fontName, out var fontData))
            {
                _logger.LogWarning("Font {FontName} not found in cache", fontName);
                return null;
            }

            var (fileName, data, contentType, uploadedAt) = fontData;

            var memoryStream = new MemoryStream(data);
            memoryStream.Position = 0;

            var formFile = new FormFile(memoryStream, 0, memoryStream.Length, fontName, fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = contentType,
            };

            return new FontFile()
            {
                File = formFile,
                FontName = fontName,
                FileName = fileName,
                UploadedAt = uploadedAt,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving font {FontName}", fontName);
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".ttf" => "font/ttf",
            ".otf" => "font/otf",
            ".woff" => "font/woff",
            ".woff2" => "font/woff2",
            ".eot" => "application/vnd.ms-fontobject",
            _ => "application/octet-stream",
        };
    }
}
