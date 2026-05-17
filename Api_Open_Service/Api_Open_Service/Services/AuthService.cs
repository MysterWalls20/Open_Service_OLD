using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Api_Open_Service.Data.Repositories;

namespace Api_Open_Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuthService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> RegistrarEmpleadoAsync(EmpleadoRegistroDto dto)
        {
            // 1. Validar duplicados de usuario o correo
            // Nota: EF Core renombra la columna 'Usuario' como 'Usuario1' para evitar conflictos con el nombre de la clase
            var usuariosExistentes = await _unitOfWork.Usuarios.FindAsync(u =>
                u.Usuario1 == dto.NombreUsuario || u.Correo == dto.Correo);

            if (usuariosExistentes.Any())
            {
                throw new ArgumentException("El nombre de usuario o correo electrónico ya se encuentra registrado.");
            }

            // 2. Validar existencia del Rol
            var rolExistente = await _unitOfWork.Roles.GetByIdAsync(dto.IdRol);
            if (rolExistente == null)
            {
                throw new KeyNotFoundException("El rol especificado no es válido.");
            }

            // 3. Crear la entidad Usuario
            var nuevoUsuario = new Usuario
            {
                Usuario1 = dto.NombreUsuario,
                Correo = dto.Correo,
                ContrasenaHash = dto.Contrasena, // Texto plano temporal
                Estado = true
            };

            await _unitOfWork.Usuarios.AddAsync(nuevoUsuario);
            await _unitOfWork.SaveAsync(); // SQL genera el ID aquí

            // 4. Crear la entidad Empleado vinculada (Relación 1:1)
            var nuevoEmpleado = new Empleado
            {
                IdEmpleado = nuevoUsuario.IdUsuario,
                Nombres = dto.Nombres,
                Apellidos = dto.Apellidos,
                IdRol = dto.IdRol
            };

            await _unitOfWork.Empleados.AddAsync(nuevoEmpleado);

            // 5. Confirmar persistencia completa
            return await _unitOfWork.SaveAsync() > 0;
        }

        public async Task<IEnumerable<RolDto>> ObtenerRolesAsync()
        {
            // Obtenemos todos los roles de la base de datos
            var rolesDb = await _unitOfWork.Roles.GetAllAsync();

            // Los transformamos al DTO que Angular espera
            return rolesDb.Select(r => new RolDto
            {
                Id = r.IdRol, // Ajusta 'IdRol' si tu propiedad se llama distinto en el modelo
                Nombre = r.NombreRol // Ajusta 'NombreRol' según tu modelo
            });
        }

        public async Task<IEnumerable<EmpleadoListadoDto>> ObtenerEmpleadosAsync()
        {
            // Obtenemos las tres tablas
            var empleados = await _unitOfWork.Empleados.GetAllAsync();
            var usuarios = await _unitOfWork.Usuarios.GetAllAsync();
            var roles = await _unitOfWork.Roles.GetAllAsync();

            // Cruzamos los datos usando LINQ para armar el listado completo
            var listado = from e in empleados
                          join u in usuarios on e.IdEmpleado equals u.IdUsuario
                          join r in roles on e.IdRol equals r.IdRol
                          select new EmpleadoListadoDto
                          {
                              Id = e.IdEmpleado,
                              Nombres = e.Nombres,
                              Apellidos = e.Apellidos,
                              Email = u.Correo,
                              Usuario = u.Usuario1,
                              RolNombre = r.NombreRol,
                              Estado = u.Estado 
                          };

            return listado.ToList();
        }

        public async Task<bool> EliminarEmpleadoAsync(int id)
        {
            // Eliminación lógica (solo desactivamos al usuario para no romper el historial de ventas)
            var usuario = await _unitOfWork.Usuarios.GetByIdAsync(id);
            if (usuario == null) return false;

            usuario.Estado = false;
            _unitOfWork.Usuarios.Update(usuario);
            return await _unitOfWork.SaveAsync() > 0;
        }
    }
}
