
using Api_Open_Service.Data;
using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Services;
using Microsoft.EntityFrameworkCore;

namespace Api_Open_Service
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            // =========================================================================
            // REGISTRO DEL DBCONTEXT (CONEXIÓN A SQL SERVER)
            // =========================================================================
            builder.Services.AddDbContext<OpenServiceDbContext>(options =>
               options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // =======================================================
            // INYECCIÓN DE DEPENDENCIAS (PATRONES DE DISEÑO)
            // =======================================================
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<IAuthService, AuthService>();



            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();


            // Justo ANTES de builder.Build();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("PermitirAngular", policy =>
                {
                    policy.WithOrigins("http://localhost:4200") // El puerto de tu Angular
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });


            var app = builder.Build();


            // Justo DESPUÉS de app.UseHttpsRedirection(); y ANTES de app.UseAuthorization();
            app.UseCors("PermitirAngular");


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
