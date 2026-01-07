using System.Text.Json;
using Microsoft.Extensions.Logging;
using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class PlayerPresetService
{
    private readonly string _presetsPath;
    private readonly List<PlayerPreset> _presets;
    private readonly Lock _lock = new();
    private readonly JsonSerializerOptions jsonSerializerOptions = new() { WriteIndented = true };
    private readonly ILogger<PlayerPresetService> _logger;

    public PlayerPresetService(ILogger<PlayerPresetService> logger)
    {
        _logger = logger;
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        _presetsPath = Path.Combine(baseDir, "player_presets.json");
        _presets = LoadFromDisk();

        _logger.LogInformation("PlayerPresetService initialized. Presets path: {Path}, loaded {Count} presets", _presetsPath, _presets.Count);
    }

    public IReadOnlyList<PlayerPreset> GetAll()
    {
        lock (_lock)
        {
            return [.. _presets];
        }
    }

    public void Upsert(PlayerPreset preset)
    {
        if (string.IsNullOrWhiteSpace(preset.Name))
        {
            _logger.LogWarning("Attempted to upsert preset with empty name");
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
                _logger.LogInformation("Updated player preset: {Name}", preset.Name);
            }
            else
            {
                _presets.Insert(0, Normalize(preset));
                _logger.LogInformation("Inserted new player preset: {Name}", preset.Name);
            }
            SaveToDisk();
        }
    }

    public void RemoveByName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            _logger.LogWarning("Attempted to remove preset with empty name");
            return;
        }

        lock (_lock)
        {
            var removed = _presets.RemoveAll(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            _logger.LogInformation("Removed {Count} presets with name {Name}", removed, name);
            SaveToDisk();
        }
    }

    public void ReplaceAll(IEnumerable<PlayerPreset> presets)
    {
        lock (_lock)
        {
            _presets.Clear();
            _presets.AddRange(presets.Select(Normalize));
            _logger.LogInformation("Replaced all player presets. New count: {Count}", _presets.Count);
            SaveToDisk();
        }
    }

    private List<PlayerPreset> LoadFromDisk()
    {
        try
        {
            if (!File.Exists(_presetsPath))
            {
                _logger.LogInformation("Presets file not found: {Path}", _presetsPath);
                return [];
            }

            var json = File.ReadAllText(_presetsPath);
            var data = JsonSerializer.Deserialize<List<PlayerPreset>>(json) ?? [];
            _logger.LogInformation("Loaded {Count} player presets from disk", data.Count);
            return data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load player presets from disk: {Path}", _presetsPath);
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
            _logger.LogInformation("Saved {Count} player presets to disk", _presets.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save player presets to disk: {Path}", _presetsPath);
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
