using System.Collections.Generic;
using System.Linq;
using Dapper;
using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class PlayerPresetService
{
    private readonly Lock _lock = new();
    private readonly ILogger<PlayerPresetService> _logger;
    private readonly DatabaseService _databaseService;

    // In-memory cache keyed by preset name (case-insensitive)
    private readonly Dictionary<string, PlayerPreset> _cache = new(
        StringComparer.OrdinalIgnoreCase
    );

    public PlayerPresetService(ILogger<PlayerPresetService> logger, DatabaseService databaseService)
    {
        _logger = logger;
        _databaseService = databaseService;

        var count = GetCount();

        _logger.LogInformation(
            "PlayerPresetService initialized. DB path: {Path}, stored {Count} presets",
            _databaseService.GetConnectionString(),
            count
        );

        // Load cache from DB
        try
        {
            LoadCache();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load player presets into cache");
        }
    }

    private void LoadCache()
    {
        lock (_lock)
        {
            using var conn = _databaseService.GetConnection();
            var sql =
                "SELECT Name, Score, Tag, Final, Flag FROM player_presets ORDER BY rowid DESC";
            var result = conn.Query<PlayerPreset>(sql).ToList();

            _cache.Clear();
            foreach (var p in result)
            {
                var n = Normalize(p);
                if (!_cache.ContainsKey(n.Name))
                {
                    _cache[n.Name] = n;
                }
            }
        }
    }

    public List<PlayerPreset> GetAll(int count = -1, string? startsWith = null)
    {
        lock (_lock)
        {
            IEnumerable<PlayerPreset> q = _cache.Values;

            if (!string.IsNullOrWhiteSpace(startsWith))
            {
                startsWith = startsWith.Trim();
                q = q.Where(p => p.Name.StartsWith(startsWith, StringComparison.OrdinalIgnoreCase));
            }

            // Order by insertion (cache filled from DB with rowid DESC), but dictionary doesn't preserve that.
            // For predictable ordering, order by Name descending similar to previous behavior using rowid DESC is not possible here,
            // so order by Name descending to maintain deterministic results.
            q = q.OrderByDescending(p => p.Name);

            if (count >= 0)
            {
                q = q.Take(count);
            }

            return [.. q];
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
            var normalized = Normalize(preset);
            using var conn = _databaseService.GetConnection();

            var sql = """
                INSERT INTO player_presets(Name, Score, Tag, Final, Flag)
                VALUES(@Name, @Score, @Tag, @Final, @Flag)
                ON CONFLICT(Name) DO UPDATE SET
                  Score = excluded.Score,
                  Tag = excluded.Tag,
                  Final = excluded.Final,
                  Flag = excluded.Flag;
                """;

            conn.Execute(sql, normalized);

            // Update cache
            _cache[normalized.Name] = normalized;

            _logger.LogInformation("Upserted player preset: {Name}", normalized.Name);
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
            using var conn = _databaseService.GetConnection();

            var sql = """DELETE FROM player_presets WHERE Name = @Name""";
            var removed = conn.Execute(sql, new { Name = name });

            // Remove from cache
            _cache.Remove(name);

            _logger.LogInformation("Removed {Count} presets with name {Name}", removed, name);
        }
    }

    private int GetCount()
    {
        try
        {
            using var conn = _databaseService.GetConnection();
            var sql = """SELECT COUNT(1) FROM player_presets""";
            return conn.ExecuteScalar<int>(sql);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to get presets count from database: {Path}",
                _databaseService.GetConnectionString()
            );
            return 0;
        }
    }

    private static PlayerPreset Normalize(PlayerPreset p) =>
        new()
        {
            Name = (p.Name).Trim(),
            Tag = p.Tag,
            Flag = p.Flag,
            Final = p.Final,
            Score = p.Score,
        };
}
