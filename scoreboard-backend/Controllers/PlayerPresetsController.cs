using Microsoft.AspNetCore.Mvc;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerPresetsController(PlayerPresetService service) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<PlayerPreset>> GetAll()
    {
        return Ok(service.GetAll());
    }

    [HttpPost]
    public IActionResult Upsert([FromBody] PlayerPreset preset)
    {
        service.Upsert(preset);
        return NoContent();
    }

    [HttpDelete("{name}")]
    public IActionResult Delete(string name)
    {
        service.RemoveByName(name);
        return NoContent();
    }
}
