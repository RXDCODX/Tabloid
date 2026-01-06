using System.Text.Json.Serialization;

namespace scoreboard_backend.Models;

public class BackgroundImage
{
    public required string ImageName
    {
        get;
        set
        {
            if (!value.Contains('.'))
            {
                throw new ArgumentException("Имя файла не может быть без расширения");
            }

            field = value;
        }
    }

    [JsonStringEnumMemberName(nameof(ImageType))]
    public ImageType ImageType;

    public bool IsShouldExists { get; set; } = true;

    [JsonIgnore]
    public IFormFile? File { get; set; }
}
