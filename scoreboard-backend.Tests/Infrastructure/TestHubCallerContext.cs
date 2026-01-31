using System.Security.Claims;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.SignalR;

namespace scoreboard_backend.Tests.Infrastructure;

public sealed class TestHubCallerContext : HubCallerContext
{
    public override string ConnectionId { get; } = Guid.NewGuid().ToString();
    public override string? UserIdentifier { get; } = "test-user";
    public override ClaimsPrincipal? User { get; } = new(new ClaimsIdentity());
    public override IDictionary<object, object?> Items { get; } = new Dictionary<object, object?>();
    public override IFeatureCollection Features { get; } = new FeatureCollection();
    public override CancellationToken ConnectionAborted { get; } = CancellationToken.None;

    public override void Abort() { }
}
