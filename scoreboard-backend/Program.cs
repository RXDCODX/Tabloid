using System.Text;
using Microsoft.AspNetCore.HttpLogging;
using scoreboard_backend.Hubs;
using scoreboard_backend.Services;

namespace scoreboard_backend;

public static class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddSingleton<ScoreboardStateService>();
        builder.Services.AddSignalR();
        builder.Services.AddCors(options =>
            options.AddPolicy(
                "CorsPolicy",
                builderr =>
                {
                    builderr
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .SetIsOriginAllowed(host => true)
                        .AllowCredentials();
                }
            )
        );
        builder.Services.AddEndpointsApiExplorer();
        if (builder.Environment.IsDevelopment())
        {
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddSwaggerGen();
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
            var adminUrl = "http://localhost:5035/adminpanel";
            var scoreboardUrl = "http://localhost:5035/scoreboard";
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
        }

        app.UseStaticFiles();
        app.UseStatusCodePages();
        app.UseRouting();
        app.UseCors("CorsPolicy");
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<ScoreboardHub>("/scoreboardHub");
            endpoints.MapFallbackToFile("index.html");
        });

        app.Run("http://localhost:5035");
    }
}
