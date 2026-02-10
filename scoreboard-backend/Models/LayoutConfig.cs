namespace scoreboard_backend.Models;

public class LayoutBlockSizeAndPosition
{
    public string? Top { get; set; }
    public string? Left { get; set; }
    public string? Right { get; set; }
    public string? Width { get; set; }
    public string? Height { get; set; }
}

public class LayoutConfig
{
    public LayoutBlockSizeAndPosition? Center { get; set; } =
        new()
        {
            Top = "15px",
            Left = "50%",
            Width = "540px",
            Height = "60px",
        };

    public LayoutBlockSizeAndPosition? Left { get; set; } =
        new()
        {
            Top = "15px",
            Left = "167px",
            Width = "540px",
            Height = "120px",
        };

    public LayoutBlockSizeAndPosition? Right { get; set; } =
        new()
        {
            Top = "15px",
            Right = "167px",
            Width = "540px",
            Height = "120px",
        };

    public LayoutBlockSizeAndPosition? FightMode { get; set; } =
        new()
        {
            Top = "150px",
            Left = "50%",
            Width = "300px",
            Height = "50px",
        };

    public LayoutBlockSizeAndPosition? Commentator1 { get; set; } =
        new()
        {
            Top = "85%",
            Left = "50px",
            Width = "300px",
            Height = "80px",
        };

    public LayoutBlockSizeAndPosition? Commentator2 { get; set; } =
        new()
        {
            Top = "50%",
            Left = "50px",
            Width = "300px",
            Height = "80px",
        };

    public LayoutBlockSizeAndPosition? Commentator3 { get; set; } =
        new()
        {
            Top = "85%",
            Right = "50px",
            Width = "300px",
            Height = "80px",
        };

    public LayoutBlockSizeAndPosition? Commentator4 { get; set; } =
        new()
        {
            Top = "50%",
            Right = "50px",
            Width = "300px",
            Height = "80px",
        };

    // Default constructor with sensible defaults matching frontend layout
}
