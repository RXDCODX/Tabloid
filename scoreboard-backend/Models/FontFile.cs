using System.Text.Json.Serialization;

namespace scoreboard_backend.Models;

public class FontFile
{
    public required string FontName { get; set; }
    public required string FileName { get; set; }
    public bool IsShouldExists { get; set; } = true;
    public long? UploadedAt { get; set; }

    [JsonIgnore]
    public IFormFile? File { get; set; }
}
