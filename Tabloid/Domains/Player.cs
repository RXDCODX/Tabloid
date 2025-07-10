namespace Tabloid.Domains;

public class Player
{
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Tag { get; set; } = nameof(Tag);
    public string Character { get; set; } = nameof(Character);
    public string Sponsor { get; set; } = string.Empty;
    public int Counter { get; set; } = 0;

    public string FullName => string.Concat(this.Tag, " | ", this.Name);
}
