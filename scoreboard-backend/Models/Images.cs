namespace scoreboard_backend.Models;

public class Images
{
    public BackgroundImage? CenterImage { get; set; } // Фоновое изображение для центрального блока
    public BackgroundImage? LeftImage { get; set; } // Фоновое изображение для левого блока
    public BackgroundImage? RightImage { get; set; } // Фоновое изображение для правого блока
    public BackgroundImage? FightModeImage { get; set; } // Фоновое изображение для блока режима драки
}
