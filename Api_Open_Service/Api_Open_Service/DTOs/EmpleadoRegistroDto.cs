namespace Api_Open_Service.DTOs
{
    public class EmpleadoRegistroDto
    {
        // Datos de acceso (Tabla Usuario)
        public string NombreUsuario { get; set; } = null!;
        public string Correo { get; set; } = null!;
        public string Contrasena { get; set; } = null!; // Sin encriptar por ahora

        // Datos personales (Tabla Empleado)
        public string Nombres { get; set; } = null!;
        public string Apellidos { get; set; } = null!;

        // El rol asignado (Tabla Rol)
        public int IdRol { get; set; }
    }
}
