using System.Text.Json.Serialization;
using scoreboard_backend.Models;

namespace scoreboard_backend.Serialization;

/// <inheritdoc />
[JsonSourceGenerationOptions(WriteIndented = true)]
[JsonSerializable(typeof(Player))]
[JsonSerializable(typeof(MetaInfo))]
[JsonSerializable(typeof(ColorPreset))]
[JsonSerializable(typeof(ColorPresetModel))]
[JsonSerializable(typeof(ScoreboardState))]
public partial class ScoreboardJsonContext : JsonSerializerContext;
