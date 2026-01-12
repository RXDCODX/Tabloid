using Microsoft.AspNetCore.Mvc;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackgroundImagesController(
    ScoreboardStateService service,
    BackgroundImagesService backgroundImagesService
) : Controller
{
    [HttpPost]
    public ActionResult UpdateBackgroundImage(
        [FromForm] ImageType imageType,
        [FromForm] IFormFile? file
    )
    {
        if (file != null)
        {
            var backgroundImage = new BackgroundImage()
            {
                ImageName = Enum.GetName(imageType) + Path.GetExtension(file.FileName),
                File = file,
                ImageType = imageType,
                IsShouldExists = true,
            };

            service.UpdateBackgroundImage(backgroundImage);
        }
        else
        {
            return BadRequest("File is empty");
        }

        return Ok();
    }

    [HttpDelete]
    public ActionResult DeleteImage([FromForm] ImageType imageType)
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
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }

        return Ok();
    }
}
