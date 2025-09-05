using Microsoft.AspNetCore.Mvc;
using scoreboard_backend.Models;
using scoreboard_backend.Services;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerPresetsController : ControllerBase
{
    private readonly PlayerPresetService _service;

    public PlayerPresetsController(PlayerPresetService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<IEnumerable<PlayerPreset>> GetAll()
    {
        return Ok(_service.GetAll());
    }

    [HttpPost]
    public IActionResult Upsert([FromBody] PlayerPreset preset)
    {
        _service.Upsert(preset);
        return NoContent();
    }

    [HttpDelete("{name}")]
    public IActionResult Delete(string name)
    {
        _service.RemoveByName(name);
        return NoContent();
    }
}


