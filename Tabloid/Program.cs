using System.Text;
using Microsoft.AspNetCore.HttpLogging;
using Tabloid.Hubs;
using Tabloid.Services;

namespace Tabloid;

public static class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddSingleton<Methods>();
        builder.Services.AddRazorPages();
        builder.Services.AddControllers();
        builder.Services.AddSignalR();

        if (builder.Environment.IsDevelopment())
        {
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddSwaggerGen();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddHttpLogging(options =>
            {
                options.LoggingFields = HttpLoggingFields.All;
            });
            builder.Logging.SetMinimumLevel(LogLevel.Trace);
        }
        else
        {
            builder.Logging.ClearProviders();
        }

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseHttpLogging();
        }
        else
        {
            // Красивое сообщение о доступности страниц
            var adminUrl = "http://localhost:5125/adminpanel";
            var scoreboardUrl = "http://localhost:5125/scoreboard";
            var oldColor = Console.ForegroundColor;
            Console.OutputEncoding = Encoding.UTF8;
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine(
                "═══════════════════════════════════════════════════════════════════════════"
            );
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("★ Добро пожаловать в Fighting ScoreBoard! ★");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(
                $"""
                🛡️  Админ-панель:                    {adminUrl}
                🏆  Scoreboard (вставить в обс):     {scoreboardUrl}
                
                """
            );
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine(
                "═══════════════════════════════════════════════════════════════════════════"
            );
            Console.ForegroundColor = oldColor;
        }

        app.UseStaticFiles();
        app.UseStatusCodePages();
        app.MapControllers();
        app.UseRouting();
        app.MapRazorPages();

        app.MapHub<MainHub>("/hub");

        app.Run();
    }
}
