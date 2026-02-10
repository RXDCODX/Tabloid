namespace scoreboard_backend.Models;

public class Images
{
    public BackgroundImage? CenterImage { get; set; } // Фоновое изображение для центрального блока
    public BackgroundImage? LeftImage { get; set; } // Фоновое изображение для левого блока
    public BackgroundImage? RightImage { get; set; } // Фоновое изображение для правого блока
    public BackgroundImage? FightModeImage { get; set; } // Фоновое изображение для блока режима драки
    public BackgroundImage? Commentator1Image { get; set; } // Фоновое изображение для комментатора 1
    public BackgroundImage? Commentator2Image { get; set; } // Фоновое изображение для комментатора 2
    public BackgroundImage? Commentator3Image { get; set; } // Фоновое изображение для комментатора 3
    public BackgroundImage? Commentator4Image { get; set; } // Фоновое изображение для комментатора 4
}
