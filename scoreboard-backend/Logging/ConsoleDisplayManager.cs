using Spectre.Console;
using Spectre.Console.Rendering;

namespace scoreboard_backend.Logging;

public class ConsoleDisplayManager
{
    private static ConsoleDisplayManager? _instance;
    private static readonly object _instanceLock = new();
    private readonly object _writeLock = new();

    private IRenderable? _headerContent;
    private int _headerHeight;
    private int _logStartLine;
    private bool _initialized;

    public static ConsoleDisplayManager Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_instanceLock)
                {
                    _instance ??= new ConsoleDisplayManager();
                }
            }
            return _instance;
        }
    }

    private ConsoleDisplayManager() { }

    public void Initialize(IRenderable headerContent)
    {
        lock (_writeLock)
        {
            if (_initialized)
                return;

            _headerContent = headerContent;

            Console.Clear();
            Console.CursorVisible = false;

            // Рендерим заголовок и определяем его высоту
            var tempConsole = AnsiConsole.Create(
                new AnsiConsoleSettings { Out = new AnsiConsoleOutput(Console.Out) }
            );

            // Сохраняем текущую позицию
            var startPos = Console.CursorTop;

            AnsiConsole.Write(headerContent);
            AnsiConsole.WriteLine();
            AnsiConsole.Write(new Rule("[dim]Логи приложения[/]") { Style = Style.Parse("dim") });
            AnsiConsole.WriteLine();

            _headerHeight = Console.CursorTop - startPos;
            _logStartLine = Console.CursorTop;

            _initialized = true;
        }
    }

    public void WriteLog(string logLine)
    {
        if (!_initialized)
        {
            AnsiConsole.MarkupLine(logLine);
            return;
        }

        lock (_writeLock)
        {
            // Проверяем, не достигли ли мы конца буфера
            if (Console.CursorTop >= Console.BufferHeight - 2)
            {
                // Перерисовываем заголовок после прокрутки
                RedrawHeader();
            }

            // Пишем лог
            AnsiConsole.MarkupLine(logLine);
        }
    }

    private void RedrawHeader()
    {
        if (_headerContent == null)
            return;

        var currentLogLine = Console.CursorTop;

        // Возвращаемся в начало
        Console.SetCursorPosition(0, 0);

        // Очищаем область заголовка
        for (int i = 0; i < _headerHeight; i++)
        {
            Console.Write(new string(' ', Console.WindowWidth));
        }

        // Возвращаемся в начало и перерисовываем
        Console.SetCursorPosition(0, 0);
        AnsiConsole.Write(_headerContent);
        AnsiConsole.WriteLine();
        AnsiConsole.Write(new Rule("[dim]Логи приложения[/]") { Style = Style.Parse("dim") });
        AnsiConsole.WriteLine();

        // Возвращаемся к логам
        Console.SetCursorPosition(0, currentLogLine);
    }

    public void RestoreCursorVisibility()
    {
        Console.CursorVisible = true;
    }
}
