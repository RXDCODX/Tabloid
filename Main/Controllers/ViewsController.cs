using Microsoft.AspNetCore.Mvc;

namespace Main.Controllers;

public class ViewsController : Controller
{
    [Route("/")]
    [Route("/AdminPanel")]
    [HttpGet]
    public IActionResult AdminPanel()
    {
        return View("AdminPanel");
    }

    [Route("/Players")]
    [HttpGet]
    public IActionResult Players()
    {
        return View("Players");
    }

    [Route("/Scoreboard")]
    [HttpGet]
    public IActionResult Scoreboard()
    {
        return View("Scoreboard");
    }
}