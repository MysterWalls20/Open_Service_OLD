using Api_Open_Service.DTOs;
using Api_Open_Service.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
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
    }

}
