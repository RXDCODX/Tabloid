using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class ColorPresetService
{
    private readonly List<ColorPresetModel> _presets;
    private readonly Lock _lock = new();
    private readonly ILogger<ColorPresetService> _logger;
    private readonly DatabaseService _databaseService;

    public ColorPresetService(ILogger<ColorPresetService> logger, DatabaseService databaseService)
    {
        _logger = logger;
        _databaseService = databaseService;

        _presets = _databaseService.LoadColorPresets();

        if (_presets.Count == 0)
        {
            InitializeDefaultPresets();
        }

        _logger.LogInformation(
            "ColorPresetService initialized. Loaded {Count} presets",
            _presets.Count
        );
    }

    public List<ColorPresetModel> GetAll()
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
            _logger.LogWarning("Upsert called with empty preset name");
            return;
        }

        lock (_lock)
        {
            var normalized = Normalize(preset);

            var idx = _presets.FindIndex(p =>
                p.Name.Equals(normalized.Name, StringComparison.OrdinalIgnoreCase)
            );
            if (idx >= 0)
            {
                _presets[idx] = normalized;
                _logger.LogInformation("Updated color preset: {Name}", normalized.Name);
            }
            else
            {
                _presets.Insert(0, normalized);
                _logger.LogInformation("Inserted new color preset: {Name}", normalized.Name);
            }

            // Persist single preset to DB
            _databaseService.UpsertColorPreset(normalized);
        }
    }

    public void RemoveByName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            _logger.LogWarning("RemoveByName called with empty name");
            return;
        }

        lock (_lock)
        {
            var removed = _presets.RemoveAll(p =>
                p.Name.Equals(name, StringComparison.OrdinalIgnoreCase)
            );
            _logger.LogInformation("Removed {Count} color presets with name {Name}", removed, name);

            // Persist removal
            _databaseService.RemoveColorPresetByName(name);
        }
    }

    private void InitializeDefaultPresets()
    {
        var defaultPresets = new List<ColorPresetModel>
        {
            new()
            {
                Name = "Default",
                PlayerNamesColor = "#FFFFFF",
                TournamentTitleColor = "#FFFFFF",
                FightModeColor = "#FFFFFF",
                ScoreColor = "#FFFFFF",
                TextOutlineColor = "#000000",
            },
            new()
            {
                Name = "Classic Blue",
                PlayerNamesColor = "#ffffff",
                TournamentTitleColor = "#0dcaf0",
                FightModeColor = "#0dcaf0",
                ScoreColor = "#0dcaf0",
                TextOutlineColor = "#000000",
            },
            new()
            {
                Name = "Fire Red",
                PlayerNamesColor = "#ffffff",
                TournamentTitleColor = "#dc3545",
                FightModeColor = "#dc3545",
                ScoreColor = "#dc3545",
                TextOutlineColor = "#000000",
            },
            new()
            {
                Name = "Forest Green",
                PlayerNamesColor = "#ffffff",
                TournamentTitleColor = "#198754",
                FightModeColor = "#198754",
                ScoreColor = "#198754",
                TextOutlineColor = "#000000",
            },
            new()
            {
                Name = "Purple Night",
                PlayerNamesColor = "#ffffff",
                TournamentTitleColor = "#6f42c1",
                FightModeColor = "#6f42c1",
                ScoreColor = "#6f42c1",
                TextOutlineColor = "#000000",
            },
            new()
            {
                Name = "Golden",
                PlayerNamesColor = "#ffffff",
                TournamentTitleColor = "#ffc107",
                FightModeColor = "#ffc107",
                ScoreColor = "#ffc107",
                TextOutlineColor = "#000000",
            },
            new()
            {
                Name = "Neon",
                PlayerNamesColor = "#ffffff",
                TournamentTitleColor = "#0088ff",
                FightModeColor = "#00ff88",
                ScoreColor = "#00ff88",
                TextOutlineColor = "#000000",
            },
        };

        lock (_lock)
        {
            _presets.AddRange(defaultPresets.Select(Normalize));
            // Persist defaults to DB
            _databaseService.ReplaceAllColorPresets(_presets);
        }
    }

    private static ColorPresetModel Normalize(ColorPresetModel p) =>
        new()
        {
            Name = (p.Name ?? string.Empty).Trim(),
            MainColor = p.MainColor,
            PlayerNamesColor = p.PlayerNamesColor,
            TournamentTitleColor = p.TournamentTitleColor,
            FightModeColor = p.FightModeColor,
            ScoreColor = p.ScoreColor,
            BackgroundColor = p.BackgroundColor,
            BorderColor = p.BorderColor,
            TextOutlineColor = p.TextOutlineColor,
        };
}
