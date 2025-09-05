using System.Text.Json;
using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class PlayerPresetService
{
    private readonly string _presetsPath;
    private readonly List<PlayerPreset> _presets;
    private readonly object _lock = new();

    public PlayerPresetService()
    {
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        _presetsPath = Path.Combine(baseDir, "player_presets.json");
        _presets = LoadFromDisk();
    }

    public IReadOnlyList<PlayerPreset> GetAll()
    {
        lock (_lock)
        {
            return _presets.ToList();
        }
    }

    public void Upsert(PlayerPreset preset)
    {
        if (string.IsNullOrWhiteSpace(preset.Name))
            return;
        lock (_lock)
        {
            var idx = _presets.FindIndex(p =>
                p.Name.Equals(preset.Name, StringComparison.OrdinalIgnoreCase)
            );
            if (idx >= 0)
            {
                _presets[idx] = Normalize(preset);
            }
            else
            {
                _presets.Insert(0, Normalize(preset));
            }
            SaveToDisk();
        }
    }

    public void RemoveByName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return;
        lock (_lock)
        {
            _presets.RemoveAll(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            SaveToDisk();
        }
    }

    public void ReplaceAll(IEnumerable<PlayerPreset> presets)
    {
        lock (_lock)
        {
            _presets.Clear();
            _presets.AddRange(presets.Select(Normalize));
            SaveToDisk();
        }
    }

    private List<PlayerPreset> LoadFromDisk()
    {
        try
        {
            if (!File.Exists(_presetsPath))
                return new List<PlayerPreset>();
            var json = File.ReadAllText(_presetsPath);
            var data =
                JsonSerializer.Deserialize<List<PlayerPreset>>(json) ?? new List<PlayerPreset>();
            return data;
        }
        catch
        {
            return new List<PlayerPreset>();
        }
    }

    private void SaveToDisk()
    {
        try
        {
            var dir = Path.GetDirectoryName(_presetsPath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            var json = JsonSerializer.Serialize(
                _presets,
                new JsonSerializerOptions { WriteIndented = true }
            );
            File.WriteAllText(_presetsPath, json);
        }
        catch
        {
            // ignore
        }
    }

    private static PlayerPreset Normalize(PlayerPreset p) =>
        new()
        {
            Name = (p.Name ?? string.Empty).Trim(),
            Tag = p.Tag ?? string.Empty,
            Flag = p.Flag ?? string.Empty,
            Sponsor = p.Sponsor ?? string.Empty,
        };
}
