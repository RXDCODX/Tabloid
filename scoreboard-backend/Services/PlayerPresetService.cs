using Dapper;
using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class PlayerPresetService
{
    private readonly Lock _lock = new();
    private readonly ILogger<PlayerPresetService> _logger;
    private readonly DatabaseService _databaseService;

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
    }

    public IReadOnlyList<PlayerPreset> GetAll(int count = -1, string? startsWith = null)
    {
        lock (_lock)
        {
            using var conn = _databaseService.GetConnection();

            var builder = new SqlBuilder();
            var template = builder.AddTemplate(
                """
                SELECT Name, Score, Tag, Final, Flag FROM player_presets /**where**/ /**orderby**/
                """
            );

            if (!string.IsNullOrWhiteSpace(startsWith))
            {
                startsWith = startsWith.Trim();
                builder.Where(
                    "Name LIKE @pattern ESCAPE '\\' COLLATE NOCASE",
                    new { pattern = startsWith + "%" }
                );
            }

            builder.OrderBy("rowid DESC");

            var sql = template.RawSql;
            var parameters = new DynamicParameters(template.Parameters);

            if (count >= 0)
            {
                sql += " LIMIT @limit";
                parameters.Add("limit", count);
            }

            var result = conn.Query<PlayerPreset>(sql, parameters).ToList();
            return result;
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
