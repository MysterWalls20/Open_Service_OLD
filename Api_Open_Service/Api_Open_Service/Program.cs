using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Api_Open_Service.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Api_Open_Service
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // =========================================================================
            // CONFIGURACIÓN DE JWT
            // =========================================================================
            var jwtSettings = builder.Configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

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

            // =======================================================
            // REGISTRO DE AUTENTICACIÓN JWT
            // =======================================================
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

            // =======================================================
            // CONFIGURACIÓN DE CONTROLADORES (FIX PARA CICLO INFINITO JSON)
            // =======================================================
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                });

            builder.Services.AddOpenApi();

            // =======================================================
            // CONFIGURACIÓN CORS (PERMITIR ANGULAR)
            // =======================================================
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("PermitirAngular", policy =>
                {
                    policy.WithOrigins("http://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            // 1. Primero permitimos que Angular se conecte (CORS)
            app.UseCors("PermitirAngular");

            // 2. 👇 LUEGO LEEMOS EL TOKEN (¡ESTO FALTABA!)
            app.UseAuthentication();

            // 3. FINALMENTE REVISAMOS LOS PERMISOS (ROLES)
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}