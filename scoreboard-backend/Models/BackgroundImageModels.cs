namespace scoreboard_backend.Models;

public class BackgroundImageUploadRequest
{
    public string ImageType { get; set; } = string.Empty;
    public IFormFile File { get; set; } = null!;
}

public class BackgroundImageUploadResponse
{
    public string ImagePath { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Success { get; set; }
}

public class BackgroundImageDeleteResponse
{
    public string Message { get; set; } = string.Empty;
    public bool Success { get; set; }
}

public class BackgroundImagesListResponse
{
    public Dictionary<string, string?> Images { get; set; } = new();
    public bool Success { get; set; }
}

public static class BackgroundImageTypes
{
    public const string CenterImage = "centerImage";
    public const string LeftImage = "leftImage";
    public const string RightImage = "rightImage";
    public const string FightModeImage = "fightModeImage";

    public static readonly string[] AllTypes = { CenterImage, LeftImage, RightImage, FightModeImage };
}
