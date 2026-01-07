using System.Text;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using scoreboard_backend.Hubs;
using scoreboard_backend.Serialization;
using scoreboard_backend.Services;

namespace scoreboard_backend;

public static class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Добавляем SPA сервисы
        builder.Services.AddSpaYarp();

        // Add services to the container.
        builder.Services.AddSingleton<ScoreboardStateService>();
        builder.Services.AddSingleton<PlayerPresetService>();
        builder.Services.AddSingleton<BackgroundImagesService>();
        builder.Services.AddSingleton<ColorPresetService>();

        builder.Services.AddControllers();
        builder
            .Services.AddSignalR()
            .AddJsonProtocol(options =>
            {
                options.PayloadSerializerOptions.TypeInfoResolverChain.Insert(
                    0,
                    ScoreboardJsonContext.Default
                );
            });
        builder.Services.AddCors(options =>
            options.AddPolicy(
                "CorsPolicy",
                builder_ =>
                {
                    builder_
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

        var app = builder.Build();

        // Настройка SpaYarp для обработки SPA маршрутов
        app.UseSpaYarp();

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

        // Настройки для статических файлов с предотвращением кеширования
        app.UseStaticFiles(
            new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    // Добавляем заголовки для предотвращения кеширования
                    ctx.Context.Response.Headers.Append(
                        "Cache-Control",
                        "no-cache, no-store, must-revalidate"
                    );
                    ctx.Context.Response.Headers.Append("Pragma", "no-cache");
                    ctx.Context.Response.Headers.Append("Expires", "0");

                    // Для HTML файлов добавляем дополнительный заголовок
                    if (ctx.File.Name.EndsWith(".html"))
                    {
                        ctx.Context.Response.Headers.Append(
                            "Cache-Control",
                            "no-cache, no-store, must-revalidate, max-age=0"
                        );
                    }
                },
            }
        );

        app.UseStatusCodePages();
        app.UseRouting();
        app.UseCors("CorsPolicy");

        app.MapHub<ScoreboardHub>("/scoreboardHub");
        app.MapControllers();

        app.Run();
    }
}
