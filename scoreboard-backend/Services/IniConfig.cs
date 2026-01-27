namespace scoreboard_backend.Services;

public class IniConfig
{
    private readonly Dictionary<string, Dictionary<string, string>> _data = [];
    private readonly string _path;

    public IniConfig(string path)
    {
        _path = path;
        if (!File.Exists(path))
        {
            return;
        }

        string? currentSection = null;
        foreach (var rawLine in File.ReadAllLines(path))
        {
            var line = rawLine.Trim();
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith(';') || line.StartsWith('#'))
            {
                continue;
            }

            if (line.StartsWith('[') && line.EndsWith(']'))
            {
                currentSection = line[1..^1];
                if (!_data.ContainsKey(currentSection))
                {
                    _data[currentSection] = [];
                }
            }
            else if (currentSection != null && line.Contains('='))
            {
                var idx = line.IndexOf('=');
                var key = line[..idx].Trim();
                var value = line[(idx + 1)..].Trim();
                _data[currentSection][key] = value;
            }
        }
    }

    public string? Get(string section, string key, string? defaultValue = null)
    {
        return _data.TryGetValue(section, out var sec) && sec.TryGetValue(key, out var val)
            ? val
            : defaultValue;
    }

    public void Set(string section, string key, string value)
    {
        if (!_data.TryGetValue(section, out var dictionary))
        {
            dictionary = [];
            _data[section] = dictionary;
        }

        dictionary[key] = value;
    }

    public void Save()
    {
        using var writer = new StreamWriter(_path, false);
        foreach (var section in _data)
        {
            writer.WriteLine($"[{section.Key}]");
            foreach (var kv in section.Value)
            {
                writer.WriteLine($"{kv.Key}={kv.Value}");
            }
            writer.WriteLine();
        }
    }
}
