using System.Collections.Concurrent;
using Spectre.Console;

namespace scoreboard_backend.Logging;

public class SpectreConsoleLoggerProvider : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName)
    {
        return new SpectreConsoleLogger(categoryName);
    }

    public void Dispose()
    {
    }
}

public class SpectreConsoleLogger : ILogger
{
    private readonly string _categoryName;

    public SpectreConsoleLogger(string categoryName)
    {
        _categoryName = categoryName;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return null;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return true;
    }

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter
    )
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        var message = formatter(state, exception);
        var categoryShort = GetShortCategory(_categoryName);

        var logColor = logLevel switch
        {
            LogLevel.Trace => "dim",
            LogLevel.Debug => "grey",
            LogLevel.Information => "green",
            LogLevel.Warning => "yellow",
            LogLevel.Error => "red",
            LogLevel.Critical => "bold red",
            _ => "white",
        };

        var logLevelShort = logLevel switch
        {
            LogLevel.Trace => "TRC",
            LogLevel.Debug => "DBG",
            LogLevel.Information => "INF",
            LogLevel.Warning => "WRN",
            LogLevel.Error => "ERR",
            LogLevel.Critical => "CRT",
            _ => "???",
        };

        var timestamp = DateTime.Now.ToString("HH:mm:ss");

        var logLine = $"[dim]{timestamp}[/] [{logColor}]{logLevelShort}[/] [blue]{categoryShort}[/]: {Markup.Escape(message)}";

        ConsoleDisplayManager.Instance.WriteLog(logLine);

        if (exception != null)
        {
            var exceptionLines = exception.ToString().Split('\n');
            foreach (var line in exceptionLines.Take(5))
            {
                ConsoleDisplayManager.Instance.WriteLog($"[red]{Markup.Escape(line)}[/]");
            }
        }
    }

    private string GetShortCategory(string category)
    {
        var parts = category.Split('.');
        if (parts.Length > 2)
        {
            return string.Join(".", parts[^2..]);
        }
        return category;
    }
}
