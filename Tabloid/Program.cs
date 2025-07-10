using Main.Services;
using Microsoft.AspNetCore.HttpLogging;
using Tabloid.Hubs;

namespace Tabloid
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddSingleton<Methods>();

            builder.Services.AddRazorPages();

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddSignalR();

            builder.Services.AddHttpLogging(options =>
            {
                options.LoggingFields = HttpLoggingFields.All;
            });

            builder.Services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = "localhost";
                options.InstanceName = "local";
            });

            builder.Logging.SetMinimumLevel(LogLevel.Trace);

            var app = builder.Build();

            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseStaticFiles();
            app.UseStatusCodePages();
            app.MapControllers();
            app.UseRouting();
            app.MapRazorPages();
            app.UseHttpLogging();

            app.MapHub<MainHub>("/hub");

            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            logger.LogCritical(
                "Если приложение не открыло страницу в браузере по умолчанию, то открой её сам по пути /swagger/index.html"
            );

            app.Run();
        }
    }
}
