using System.Text.Json.Serialization;

namespace scoreboard_backend.Models;

public class BackgroundImage
{
    public required string ImageName { get; set; }

    [JsonStringEnumMemberName(nameof(ImageType))]
    public ImageType ImageType;

    public bool IsShouldExists { get; set; } = true;

    [JsonIgnore]
    public IFormFile? File { get; set; }
}
