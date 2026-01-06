using System.Text.Json;
using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class ColorPresetService
{
    private readonly string _presetsPath;
    private readonly List<ColorPresetModel> _presets;
    private readonly Lock _lock = new();
    private readonly JsonSerializerOptions jsonSerializerOptions = new() { WriteIndented = true };

    public ColorPresetService()
    {
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        _presetsPath = Path.Combine(baseDir, "color_presets.json");
        _presets = LoadFromDisk();
        
        if (_presets.Count == 0)
        {
            InitializeDefaultPresets();
        }
    }

    public IReadOnlyList<ColorPresetModel> GetAll()
    {
        lock (_lock)
        {
            return [.. _presets];
        }
    }

    public void Upsert(ColorPresetModel preset)
    {
        if (string.IsNullOrWhiteSpace(preset.Name))
        {
            return;
        }

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
        {
            return;
        }

        lock (_lock)
        {
            _presets.RemoveAll(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            SaveToDisk();
        }
    }

    public void ReplaceAll(IEnumerable<ColorPresetModel> presets)
    {
        lock (_lock)
        {
            _presets.Clear();
            _presets.AddRange(presets.Select(Normalize));
            SaveToDisk();
        }
    }

    private List<ColorPresetModel> LoadFromDisk()
    {
        try
        {
            if (!File.Exists(_presetsPath))
            {
                return [];
            }

            var json = File.ReadAllText(_presetsPath);
            var data = JsonSerializer.Deserialize<List<ColorPresetModel>>(json) ?? [];
            return data;
        }
        catch
        {
            return [];
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
            var json = JsonSerializer.Serialize(_presets, jsonSerializerOptions);
            File.WriteAllText(_presetsPath, json);
        }
        catch
        {
            // ignore
        }
    }

    private void InitializeDefaultPresets()
    {
        var defaultPresets = new List<ColorPresetModel>
        {
            new() { Name = "Default", PlayerNamesColor = "#FFFFFF", TournamentTitleColor = "#FFFFFF", FightModeColor = "#FFFFFF", ScoreColor = "#FFFFFF" },
            new() { Name = "Classic Blue", PlayerNamesColor = "#ffffff", TournamentTitleColor = "#0dcaf0", FightModeColor = "#0dcaf0", ScoreColor = "#0dcaf0" },
            new() { Name = "Fire Red", PlayerNamesColor = "#ffffff", TournamentTitleColor = "#dc3545", FightModeColor = "#dc3545", ScoreColor = "#dc3545" },
            new() { Name = "Forest Green", PlayerNamesColor = "#ffffff", TournamentTitleColor = "#198754", FightModeColor = "#198754", ScoreColor = "#198754" },
            new() { Name = "Purple Night", PlayerNamesColor = "#ffffff", TournamentTitleColor = "#6f42c1", FightModeColor = "#6f42c1", ScoreColor = "#6f42c1" },
            new() { Name = "Golden", PlayerNamesColor = "#ffffff", TournamentTitleColor = "#ffc107", FightModeColor = "#ffc107", ScoreColor = "#ffc107" },
            new() { Name = "Neon", PlayerNamesColor = "#ffffff", TournamentTitleColor = "#0088ff", FightModeColor = "#00ff88", ScoreColor = "#00ff88" }
        };
        
        lock (_lock)
        {
            _presets.AddRange(defaultPresets);
            SaveToDisk();
        }
    }

    private static ColorPresetModel Normalize(ColorPresetModel p) =>
        new()
        {
            Name = (p.Name ?? string.Empty).Trim(),
            PlayerNamesColor = p.PlayerNamesColor,
            TournamentTitleColor = p.TournamentTitleColor,
            FightModeColor = p.FightModeColor,
            ScoreColor = p.ScoreColor
        };
}
