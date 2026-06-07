using Api_Open_Service.DTOs;
using Api_Open_Service.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;

        // Inyectamos el servicio de autenticación y la configuración (para leer appsettings.json)
        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("registrar-empleado")]
        public async Task<IActionResult> RegistrarEmpleado([FromBody] EmpleadoRegistroDto dto)
        {
            try
            {
                var resultado = await _authService.RegistrarEmpleadoAsync(dto);
                if (resultado)
                {
                    return Ok(new { mensaje = "Empleado registrado exitosamente." });
                }
                return BadRequest(new { mensaje = "No se pudo completar el registro del empleado." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno en el servidor." });
            }
        }

        [HttpGet("roles")]
        public async Task<IActionResult> ObtenerRoles()
        {
            try
            {
                var roles = await _authService.ObtenerRolesAsync();
                return Ok(roles);
            }
            catch (Exception)
            {
                return StatusCode(500, new { mensaje = "Error al obtener los roles de la base de datos." });
            }
        }

        [HttpGet("empleados")]
        public async Task<IActionResult> ObtenerEmpleados()
        {
            var empleados = await _authService.ObtenerEmpleadosAsync();
            return Ok(empleados);
        }

        [HttpDelete("empleado/{id}")]
        public async Task<IActionResult> EliminarEmpleado(int id)
        {
            var resultado = await _authService.EliminarEmpleadoAsync(id);
            if (resultado) return Ok(new { mensaje = "Empleado desactivado correctamente." });
            return BadRequest(new { mensaje = "No se pudo eliminar el empleado." });
        }

        [HttpPut("empleado")]
        public async Task<IActionResult> EditarEmpleado([FromBody] EmpleadoEdicionDto dto)
        {
            var resultado = await _authService.EditarEmpleadoAsync(dto);
            if (resultado) return Ok(new { mensaje = "Empleado actualizado correctamente." });

            return BadRequest(new { mensaje = "No se pudo actualizar el empleado." });
        }

        [HttpPut("mi-perfil")]
        public async Task<IActionResult> ActualizarMiPerfil([FromBody] ActualizarPerfilDto dto)
        {
            try
            {
                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
                }

                var resultado = await _authService.ActualizarPerfilAsync(dto, email);
                if (resultado)
                {
                    return Ok(new { mensaje = "Perfil actualizado correctamente." });
                }
                return BadRequest(new { mensaje = "No se pudo actualizar el perfil." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { mensaje = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno en el servidor." });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                // Usamos dynamic para aceptar el objeto (DTO o Entidad) que devuelve tu servicio
                dynamic resultado = await _authService.LoginAsync(dto);

                if (resultado != null)
                {
                    // 1. Traemos la configuración secreta de appsettings.json
                    var jwtSettings = _configuration.GetSection("Jwt");
                    var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

                    // 2. Extraemos los valores. 
                    // NOTA: En C# las propiedades suelen ser en PascalCase (mayúscula inicial). 
                    // Si tu modelo las tiene en minúscula, solo cámbialas aquí (ej: resultado.nombres)
                    string nombreEmpleado = (string)resultado.Nombre; 
                    string correoEmpleado = (string)resultado.Email;  
                    string rolEmpleado = (string)resultado.Rol;

                    // 3. Empaquetamos la identidad del usuario en "Claims"
                    var claims = new[]
                    {
                        new Claim(ClaimTypes.Name, nombreEmpleado),
                        new Claim(ClaimTypes.Email, correoEmpleado),
                        new Claim(ClaimTypes.Role, rolEmpleado)
                    };

                    // 4. Firmamos y creamos el Token
                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(claims),
                        Expires = DateTime.UtcNow.AddHours(8), // El token durará 8 horas
                        Issuer = jwtSettings["Issuer"],
                        Audience = jwtSettings["Audience"],
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };

                    var tokenHandler = new JwtSecurityTokenHandler();
                    var token = tokenHandler.CreateToken(tokenDescriptor);

                    // 5. Devolvemos el Token real y los datos de la sesión para Angular
                    return Ok(new
                    {
                        mensaje = "Login exitoso",
                        token = tokenHandler.WriteToken(token),
                        usuario = new
                        {
                            nombres = nombreEmpleado,
                            correo = correoEmpleado,
                            rol = rolEmpleado
                        }
                    });
                }

                return Unauthorized(new { mensaje = "Credenciales incorrectas." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                // Extraemos el error real y lo mandamos al frontend para verlo con nuestros propios ojos
                string errorReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { mensaje = $"Error exacto de C#: {errorReal}" });
            }

        }
    }
}