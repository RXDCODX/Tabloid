using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using scoreboard_backend.Models;

namespace scoreboard_backend.Serialization;

[JsonSourceGenerationOptions(
    WriteIndented = false,
    GenerationMode = JsonSourceGenerationMode.Metadata
)]
[JsonSerializable(typeof(string))]
[JsonSerializable(typeof(PlayerPreset))]
[JsonSerializable(typeof(IEnumerable<PlayerPreset>))]
#pragma warning disable CS0229
public partial class AppJsonContext : JsonSerializerContext { }
