using scoreboard_backend.Logging;
using Spectre.Console;

namespace scoreboard_backend.Extensions;

public static class WebApplicationExtensions
{
    public static void ShowWelcomePanel(this WebApplication app)
    {
        // Выводим приветственную панель перед запуском сервера
        const string adminUrl = "http://localhost:5035/adminpanel";
        const string scoreboardUrl = "http://localhost:5035/scoreboard";

        // Создаем заголовок
        var ruleTitle = app.Environment.IsDevelopment()
            ? "[bold yellow]Fighting ScoreBoard [dim](Development)[/][/]"
            : "[bold magenta]Fighting ScoreBoard[/]";

        var ruleStyle = app.Environment.IsDevelopment()
            ? Style.Parse("yellow")
            : Style.Parse("magenta");

        // Создаем панель с информацией о ссылках
        var panelContent = app.Environment.IsDevelopment()
            ? $"[yellow]🛡️  Админ-панель:[/]                    [link={adminUrl}][cyan]{adminUrl}[/][/]\n"
                + $"[yellow]🏆  Scoreboard (вставить в обс):[/]     [link={scoreboardUrl}][cyan]{scoreboardUrl}[/][/]\n"
                + $"[yellow]📄  Swagger:[/]                         [link=http://localhost:5035/swagger][cyan]http://localhost:5035/swagger[/][/]"
            : $"[yellow]🛡️  Админ-панель:[/]                    [link={adminUrl}][cyan]{adminUrl}[/][/]\n"
                + $"[yellow]🏆  Scoreboard (вставить в обс):[/]     [link={scoreboardUrl}][cyan]{scoreboardUrl}[/][/]";

        var panelBorderStyle = app.Environment.IsDevelopment()
            ? new Style(Color.Yellow)
            : new Style(Color.Magenta);

        var panel = new Panel(new Markup(panelContent))
        {
            Header = new PanelHeader("[bold cyan]★ Добро пожаловать! ★[/]", Justify.Center),
            Border = BoxBorder.Double,
            BorderStyle = panelBorderStyle,
            Padding = new Padding(2, 1, 2, 1),
        };

        // Создаем полный заголовок с разделителем
        var headerContent = new Rows(
            new Rule(ruleTitle) { Style = ruleStyle },
            new Text(""),
            panel
        );

        // Инициализируем менеджер дисплея с закрепленной панелью
        ConsoleDisplayManager.Instance.Initialize(headerContent);
    }
}
