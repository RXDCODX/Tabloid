using System.Collections.Generic;
using System.Text.Json.Serialization;
using scoreboard_backend.Models;

namespace scoreboard_backend.Serialization;

/// <inheritdoc />
[JsonSourceGenerationOptions(WriteIndented = true, UseStringEnumConverter = true)]
[JsonSerializable(typeof(Player))]
[JsonSerializable(typeof(MetaInfo))]
[JsonSerializable(typeof(ColorPreset))]
[JsonSerializable(typeof(ColorPresetModel))]
[JsonSerializable(typeof(List<ColorPresetModel>))]
[JsonSerializable(typeof(ColorPresetModel[]))]
[JsonSerializable(typeof(IReadOnlyList<ColorPresetModel>))]
[JsonSerializable(typeof(PlayerPreset))]
[JsonSerializable(typeof(List<PlayerPreset>))]
[JsonSerializable(typeof(PlayerPreset[]))]
[JsonSerializable(typeof(IReadOnlyList<PlayerPreset>))]
[JsonSerializable(typeof(ScoreboardState))]
[JsonSerializable(typeof(ImageType))]
public partial class ScoreboardJsonContext : JsonSerializerContext;
