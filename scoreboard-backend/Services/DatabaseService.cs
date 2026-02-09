using Microsoft.Data.Sqlite;
using scoreboard_backend.Models;

namespace scoreboard_backend.Services;

public class DatabaseService
{
    private readonly string _dbPath;
    private readonly ILogger<DatabaseService> _logger;

    public DatabaseService(ILogger<DatabaseService> logger)
    {
        _logger = logger;
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        _dbPath = Path.Combine(baseDir, "database.db");

        EnsureDatabase();

        _logger.LogInformation("DatabaseService initialized. DB path: {Path}", _dbPath);
    }

    public string GetConnectionString() => $"Data Source={_dbPath}";

    public SqliteConnection GetConnection()
    {
        var conn = new SqliteConnection(GetConnectionString());
        conn.Open();
        return conn;
    }

    private void EnsureDatabase()
    {
        try
        {
            var dir = Path.GetDirectoryName(_dbPath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            using var conn = new SqliteConnection(GetConnectionString());
            conn.Open();

            // Ensure current schema (uses Flag column)
            var sql = """
                CREATE TABLE IF NOT EXISTS player_presets (
                            Name TEXT PRIMARY KEY,
                            Score INTEGER NOT NULL,
                            Tag TEXT,
                            Final TEXT,
                            Flag TEXT
                         );
                """;

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.ExecuteNonQuery();

            // Create table for persisted scoreboard state (single-row table)
            var stateSql = """
                CREATE TABLE IF NOT EXISTS scoreboard_state (
                    Id INTEGER PRIMARY KEY CHECK (Id = 1),
                    StateJson TEXT NOT NULL,
                    UpdatedAt TEXT
                );
                """;

            using var stateCmd = conn.CreateCommand();
            stateCmd.CommandText = stateSql;
            stateCmd.ExecuteNonQuery();

            // Create table for color presets
            var colorSql = """
                CREATE TABLE IF NOT EXISTS color_presets (
                    Name TEXT PRIMARY KEY,
                    MainColor TEXT,
                    PlayerNamesColor TEXT,
                    TournamentTitleColor TEXT,
                    FightModeColor TEXT,
                    ScoreColor TEXT,
                    BackgroundColor TEXT,
                    BorderColor TEXT,
                    UpdatedAt TEXT
                );
                """;

            using var colorCmd = conn.CreateCommand();
            colorCmd.CommandText = colorSql;
            colorCmd.ExecuteNonQuery();

            // Create table for background images
            var imagesSql = """
                CREATE TABLE IF NOT EXISTS background_images (
                    ImageType TEXT PRIMARY KEY,
                    ImageName TEXT NOT NULL,
                    ImageData BLOB NOT NULL,
                    ContentType TEXT NOT NULL,
                    UploadedAt INTEGER NOT NULL
                );
                """;

            using var imagesCmd = conn.CreateCommand();
            imagesCmd.CommandText = imagesSql;
            imagesCmd.ExecuteNonQuery();

            // Create table for fonts
            var fontsSql = """
                CREATE TABLE IF NOT EXISTS fonts (
                    FontName TEXT PRIMARY KEY,
                    FileName TEXT NOT NULL,
                    FontData BLOB NOT NULL,
                    ContentType TEXT NOT NULL,
                    UploadedAt INTEGER NOT NULL
                );
                """;

            using var fontsCmd = conn.CreateCommand();
            fontsCmd.CommandText = fontsSql;
            fontsCmd.ExecuteNonQuery();

            // Detect legacy schema: if player_presets has a 'Country' column, migrate it to 'Flag'
            try
            {
                using var pragmaCmd = conn.CreateCommand();
                pragmaCmd.CommandText = "PRAGMA table_info('player_presets');";

                var hasCountry = false;
                using (var reader = pragmaCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var colName = reader.GetString(1);
                        if (string.Equals(colName, "Country", StringComparison.OrdinalIgnoreCase))
                        {
                            hasCountry = true;
                            break;
                        }
                    }
                }

                if (hasCountry)
                {
                    _logger.LogInformation(
                        "Legacy column 'Country' detected in player_presets - migrating to 'Flag'"
                    );
                    using var trans = conn.BeginTransaction();

                    // Create new table with desired schema
                    using (var createCmd = conn.CreateCommand())
                    {
                        createCmd.CommandText = """
                            CREATE TABLE IF NOT EXISTS player_presets_new (
                                Name TEXT PRIMARY KEY,
                                Score INTEGER NOT NULL,
                                Tag TEXT,
                                Final TEXT,
                                Flag TEXT
                            );
                            """;
                        createCmd.ExecuteNonQuery();
                    }

                    // Copy data mapping Country -> Flag
                    using (var copyCmd = conn.CreateCommand())
                    {
                        copyCmd.CommandText =
                            "INSERT OR REPLACE INTO player_presets_new(Name, Score, Tag, Final, Flag) SELECT Name, Score, Tag, Final, Country FROM player_presets;";
                        copyCmd.ExecuteNonQuery();
                    }

                    // Drop old table and rename new
                    using (var dropCmd = conn.CreateCommand())
                    {
                        dropCmd.CommandText = "DROP TABLE player_presets;";
                        dropCmd.ExecuteNonQuery();
                    }

                    using (var renameCmd = conn.CreateCommand())
                    {
                        renameCmd.CommandText =
                            "ALTER TABLE player_presets_new RENAME TO player_presets;";
                        renameCmd.ExecuteNonQuery();
                    }

                    trans.Commit();
                    _logger.LogInformation("Migration completed: 'Country' -> 'Flag'");
                }
            }
            catch (Exception mex)
            {
                _logger.LogError(
                    mex,
                    "Error while checking/migrating legacy player_presets schema"
                );
                // proceed without failing startup
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure database exists: {Path}", _dbPath);
            // ignore
        }
    }

    public string? LoadStateJson()
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT StateJson FROM scoreboard_state WHERE Id = 1 LIMIT 1";
            var res = cmd.ExecuteScalar();
            return res is null or DBNull ? null : Convert.ToString(res);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load state JSON from DB");
            return null;
        }
    }

    public void SaveStateJson(string json)
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                INSERT INTO scoreboard_state(Id, StateJson, UpdatedAt)
                VALUES(1, @json, @updatedAt)
                ON CONFLICT(Id) DO UPDATE SET
                  StateJson = excluded.StateJson,
                  UpdatedAt = excluded.UpdatedAt;
                """;
            var p = cmd.CreateParameter();
            p.ParameterName = "@json";
            p.Value = json;
            cmd.Parameters.Add(p);

            var p2 = cmd.CreateParameter();
            p2.ParameterName = "@updatedAt";
            p2.Value = DateTime.UtcNow.ToString("o");
            cmd.Parameters.Add(p2);

            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save state JSON to DB");
            // ignore
        }
    }

    // Color presets operations
    public List<ColorPresetModel> LoadColorPresets()
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText =
                "SELECT Name, MainColor, PlayerNamesColor, TournamentTitleColor, FightModeColor, ScoreColor, BackgroundColor, BorderColor FROM color_presets ORDER BY rowid DESC";

            using var reader = cmd.ExecuteReader();
            var list = new List<ColorPresetModel>();
            while (reader.Read())
            {
                var model = new ColorPresetModel()
                {
                    Name = reader.GetString(0),
                    MainColor = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
                    PlayerNamesColor = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                    TournamentTitleColor = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                    FightModeColor = reader.IsDBNull(4) ? string.Empty : reader.GetString(4),
                    ScoreColor = reader.IsDBNull(5) ? string.Empty : reader.GetString(5),
                    BackgroundColor = reader.IsDBNull(6) ? string.Empty : reader.GetString(6),
                    BorderColor = reader.IsDBNull(7) ? string.Empty : reader.GetString(7),
                };
                list.Add(model);
            }

            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load color presets from DB");
            return [];
        }
    }

    public void UpsertColorPreset(ColorPresetModel preset)
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                INSERT INTO color_presets(Name, MainColor, PlayerNamesColor, TournamentTitleColor, FightModeColor, ScoreColor, BackgroundColor, BorderColor, UpdatedAt)
                VALUES(@Name, @MainColor, @PlayerNamesColor, @TournamentTitleColor, @FightModeColor, @ScoreColor, @BackgroundColor, @BorderColor, @updatedAt)
                ON CONFLICT(Name) DO UPDATE SET
                  MainColor = excluded.MainColor,
                  PlayerNamesColor = excluded.PlayerNamesColor,
                  TournamentTitleColor = excluded.TournamentTitleColor,
                  FightModeColor = excluded.FightModeColor,
                  ScoreColor = excluded.ScoreColor,
                  BackgroundColor = excluded.BackgroundColor,
                  BorderColor = excluded.BorderColor,
                  UpdatedAt = excluded.UpdatedAt;
                """;

            void AddParam(string name, object? value)
            {
                var p = cmd.CreateParameter();
                p.ParameterName = name;
                p.Value = value ?? DBNull.Value;
                cmd.Parameters.Add(p);
            }

            AddParam("@Name", preset.Name);
            AddParam("@MainColor", preset.MainColor);
            AddParam("@PlayerNamesColor", preset.PlayerNamesColor);
            AddParam("@TournamentTitleColor", preset.TournamentTitleColor);
            AddParam("@FightModeColor", preset.FightModeColor);
            AddParam("@ScoreColor", preset.ScoreColor);
            AddParam("@BackgroundColor", preset.BackgroundColor);
            AddParam("@BorderColor", preset.BorderColor);
            AddParam("@updatedAt", DateTime.UtcNow.ToString("o"));

            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upsert color preset to DB: {Name}", preset?.Name);
        }
    }

    public void RemoveColorPresetByName(string name)
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM color_presets WHERE Name = @Name";
            var p = cmd.CreateParameter();
            p.ParameterName = "@Name";
            p.Value = name;
            cmd.Parameters.Add(p);
            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to remove color preset from DB: {Name}", name);
        }
    }

    public void ReplaceAllColorPresets(IEnumerable<ColorPresetModel> presets)
    {
        try
        {
            using var conn = GetConnection();
            using var trans = conn.BeginTransaction();

            using var delCmd = conn.CreateCommand();
            delCmd.CommandText = "DELETE FROM color_presets";
            delCmd.ExecuteNonQuery();

            using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = """
                INSERT INTO color_presets(Name, MainColor, PlayerNamesColor, TournamentTitleColor, FightModeColor, ScoreColor, BackgroundColor, BorderColor, UpdatedAt)
                VALUES(@Name, @MainColor, @PlayerNamesColor, @TournamentTitleColor, @FightModeColor, @ScoreColor, @BackgroundColor, @BorderColor, @updatedAt)
                """;

            foreach (var preset in presets)
            {
                insertCmd.Parameters.Clear();
                void AddParam(string name, object? value)
                {
                    var p = insertCmd.CreateParameter();
                    p.ParameterName = name;
                    p.Value = value ?? DBNull.Value;
                    insertCmd.Parameters.Add(p);
                }

                AddParam("@Name", preset.Name);
                AddParam("@MainColor", preset.MainColor);
                AddParam("@PlayerNamesColor", preset.PlayerNamesColor);
                AddParam("@TournamentTitleColor", preset.TournamentTitleColor);
                AddParam("@FightModeColor", preset.FightModeColor);
                AddParam("@ScoreColor", preset.ScoreColor);
                AddParam("@BackgroundColor", preset.BackgroundColor);
                AddParam("@BorderColor", preset.BorderColor);
                AddParam("@updatedAt", DateTime.UtcNow.ToString("o"));

                insertCmd.ExecuteNonQuery();
            }

            trans.Commit();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to replace all color presets in DB");
        }
    }

    // Background images methods
    public void SaveBackgroundImage(
        string imageType,
        string imageName,
        byte[] imageData,
        string contentType,
        long uploadedAt
    )
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                INSERT OR REPLACE INTO background_images(ImageType, ImageName, ImageData, ContentType, UploadedAt)
                VALUES(@imageType, @imageName, @imageData, @contentType, @uploadedAt)
                """;

            cmd.Parameters.AddWithValue("@imageType", imageType);
            cmd.Parameters.AddWithValue("@imageName", imageName);
            cmd.Parameters.AddWithValue("@imageData", imageData);
            cmd.Parameters.AddWithValue("@contentType", contentType);
            cmd.Parameters.AddWithValue("@uploadedAt", uploadedAt);

            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save background image to DB: {ImageType}", imageType);
        }
    }

    public void DeleteBackgroundImage(string imageType)
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM background_images WHERE ImageType = @imageType";
            cmd.Parameters.AddWithValue("@imageType", imageType);
            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to delete background image from DB: {ImageType}",
                imageType
            );
        }
    }

    public Dictionary<
        string,
        (string ImageName, byte[] ImageData, string ContentType, long UploadedAt)
    > LoadAllBackgroundImages()
    {
        var result =
            new Dictionary<
                string,
                (string ImageName, byte[] ImageData, string ContentType, long UploadedAt)
            >();

        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText =
                "SELECT ImageType, ImageName, ImageData, ContentType, UploadedAt FROM background_images";

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var imageType = reader.GetString(0);
                var imageName = reader.GetString(1);
                var imageData = (byte[])reader["ImageData"];
                var contentType = reader.GetString(3);
                var uploadedAt = reader.GetInt64(4);

                result[imageType] = (imageName, imageData, contentType, uploadedAt);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load background images from DB");
        }

        return result;
    }

    public void ClearAllBackgroundImages()
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM background_images";
            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear all background images from DB");
        }
    }

    // Font files methods
    public void SaveFont(
        string fontName,
        string fileName,
        byte[] fontData,
        string contentType,
        long uploadedAt
    )
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                INSERT OR REPLACE INTO fonts(FontName, FileName, FontData, ContentType, UploadedAt)
                VALUES(@fontName, @fileName, @fontData, @contentType, @uploadedAt)
                """;

            cmd.Parameters.AddWithValue("@fontName", fontName);
            cmd.Parameters.AddWithValue("@fileName", fileName);
            cmd.Parameters.AddWithValue("@fontData", fontData);
            cmd.Parameters.AddWithValue("@contentType", contentType);
            cmd.Parameters.AddWithValue("@uploadedAt", uploadedAt);

            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save font to DB: {FontName}", fontName);
        }
    }

    public void DeleteFont(string fontName)
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM fonts WHERE FontName = @fontName";
            cmd.Parameters.AddWithValue("@fontName", fontName);
            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete font from DB: {FontName}", fontName);
        }
    }

    public Dictionary<
        string,
        (string FileName, byte[] FontData, string ContentType, long UploadedAt)
    > LoadAllFonts()
    {
        var result =
            new Dictionary<
                string,
                (string FileName, byte[] FontData, string ContentType, long UploadedAt)
            >();

        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText =
                "SELECT FontName, FileName, FontData, ContentType, UploadedAt FROM fonts";

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var fontName = reader.GetString(0);
                var fileName = reader.GetString(1);
                var fontData = (byte[])reader["FontData"];
                var contentType = reader.GetString(3);
                var uploadedAt = reader.GetInt64(4);

                result[fontName] = (fileName, fontData, contentType, uploadedAt);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load fonts from DB");
        }

        return result;
    }

    public void ClearAllFonts()
    {
        try
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM fonts";
            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear all fonts from DB");
        }
    }
}
