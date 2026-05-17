using Api_Open_Service.DTOs;

namespace Api_Open_Service.Services
{
    public interface IAuthService
    {
        Task<bool> RegistrarEmpleadoAsync(EmpleadoRegistroDto dto);

        Task<IEnumerable<RolDto>> ObtenerRolesAsync();
        Task<IEnumerable<EmpleadoListadoDto>> ObtenerEmpleadosAsync();
        Task<bool> EliminarEmpleadoAsync(int id);
    }
}
