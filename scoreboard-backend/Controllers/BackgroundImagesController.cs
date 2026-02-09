using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using scoreboard_backend.Hubs;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackgroundImagesController(
    ScoreboardStateService service,
    BackgroundImagesService backgroundImagesService,
    IHubContext<ScoreboardHub> hubContext
) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> UpdateBackgroundImage(
        [FromForm] ImageType imageType,
        [FromForm] IFormFile? file
    )
    {
        if (file != null)
        {
            // Validate file type
            var allowedExtensions = new[]
            {
                ".png",
                ".jpg",
                ".jpeg",
                ".gif",
                ".webp",
                ".mp4",
                ".webm",
                ".mov",
            };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(
                    $"Unsupported file type. Allowed: {string.Join(", ", allowedExtensions)}"
                );
            }

            var backgroundImage = new BackgroundImage()
            {
                ImageName = Enum.GetName(imageType) + Path.GetExtension(file.FileName),
                File = file,
                ImageType = imageType,
                IsShouldExists = true,
                UploadedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            };

            service.UpdateBackgroundImage(backgroundImage);

            // Отправляем обновленное состояние всем клиентам через SignalR
            await hubContext.Clients.All.SendAsync(
                ScoreboardHub.MainReceiveStateMethodName,
                service.GetState()
            );
        }
        else
        {
            return BadRequest("File is empty");
        }

        return Ok();
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteImage([FromForm] ImageType imageType)
    {
        try
        {
            // Request deletion: this updates files on disk and clears corresponding in-memory image
            service.UpdateBackgroundImage(
                new BackgroundImage
                {
                    IsShouldExists = false,
                    ImageType = imageType,
                    ImageName = string.Empty,
                }
            );

            // Отправляем обновленное состояние всем клиентам через SignalR
            await hubContext.Clients.All.SendAsync(
                ScoreboardHub.MainReceiveStateMethodName,
                service.GetState()
            );

            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }
    }

    [HttpDelete("all")]
    public async Task<ActionResult> DeleteAllImages()
    {
        try
        {
            await backgroundImagesService.ClearAllImages();
            var state = service.GetState();
            state.Images = new Images();
            service.SetState(state);

            // Отправляем обновленное состояние всем клиентам через SignalR
            await hubContext.Clients.All.SendAsync(
                ScoreboardHub.MainReceiveStateMethodName,
                service.GetState()
            );
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }

        return Ok();
    }
}
