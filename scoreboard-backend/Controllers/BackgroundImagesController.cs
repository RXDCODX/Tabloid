using Microsoft.AspNetCore.Mvc;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackgroundImagesController(ScoreboardStateService service) : Controller
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
            service.UpdateBackgroundImage(
                new BackgroundImage()
                {
                    IsShouldExists = false,
                    ImageType = imageType,
                    ImageName = string.Empty,
                }
            );
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }

        return Ok();
    }
}
