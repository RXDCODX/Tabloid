using Microsoft.AspNetCore.HttpLogging;
using scoreboard_backend.Extensions;
using scoreboard_backend.Hubs;
using scoreboard_backend.Logging;
using scoreboard_backend.Serialization;
using scoreboard_backend.Services;

namespace scoreboard_backend;

public static class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Настраиваем логирование с использованием Spectre.Console для всех режимов
        builder.Logging.ClearProviders();
        builder.Logging.AddProvider(new SpectreConsoleLoggerProvider());

        // Добавляем SPA сервисы
        if (builder.Environment.IsDevelopment())
        {
            builder.Services.AddSpaYarp();
        }

        // Add services to the container.
        builder.Services.AddSingleton<ScoreboardStateService>();
        builder.Services.AddSingleton<DatabaseService>();
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

        if (builder.Environment.IsDevelopment())
        {
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddHttpLogging(options =>
            {
                options.LoggingFields = HttpLoggingFields.All;
            });
            builder.Logging.SetMinimumLevel(LogLevel.Debug);
        }
        else
        {
            builder.Logging.SetMinimumLevel(LogLevel.Information);
        }

        var app = builder.Build();

        // Настройка SpaYarp для обработки SPA маршрутов

        if (app.Environment.IsDevelopment())
        {
            app.UseSpaYarp();
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseHttpLogging();
        }
        else
        {
            app.MapFallbackToFile("index.html");
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

        // Выводим приветственную панель через метод-расширение
        app.ShowWelcomePanel();

        app.Run();
    }
}
