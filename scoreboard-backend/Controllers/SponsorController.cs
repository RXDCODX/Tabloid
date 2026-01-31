using Microsoft.AspNetCore.Mvc;

namespace scoreboard_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SponsorController : ControllerBase
{
    [HttpGet("is-sponsor-disabled")]
    public ActionResult<bool> IsSponsorDisabled()
    {
        try
        {
            // Получаем текущую директорию приложения
            var appDirectory = AppContext.BaseDirectory;
            
            // Ищем файлы с названием "RXDCODX" с любым расширением
            var files = Directory.GetFiles(appDirectory, "RXDCODX*");
            
            // Если файл найден - спонсорский баннер отключен (возвращаем true)
            var isSponsorDisabled = files.Length > 0;
            
            return Ok(isSponsorDisabled);
        }
        catch (Exception ex)
        {
            // В случае ошибки логируем и возвращаем false (баннер включен)
            Console.WriteLine($"Error checking sponsor file: {ex.Message}");
            return Ok(false);
        }
    }
}
