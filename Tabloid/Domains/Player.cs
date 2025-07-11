namespace Tabloid.Domains;

public class Player
{
    public string Name { get; set; } = nameof(Name);
    public string Country { get; set; } = nameof(Country);
    public string Tag { get; set; } = nameof(Tag);
    public string Character { get; set; } = nameof(Character);
    public string Sponsor { get; set; } = nameof(Sponsor);
    public int Counter { get; set; } = 0;

    public string FullName => string.Concat(this.Tag, " | ", this.Name);
}
