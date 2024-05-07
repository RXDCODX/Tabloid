using Main.Hubs;
using Main.Services;

namespace Main
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

            builder.Logging.SetMinimumLevel(LogLevel.Trace);

            var app = builder.Build();

            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseStaticFiles();
            app.UseStatusCodePages();
            app.MapControllers();
            app.UseRouting();
            app.MapRazorPages();

            app.MapHub<MainHub>("/hub");

            app.Run();
        }
    }
}
