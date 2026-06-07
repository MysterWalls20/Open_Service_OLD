namespace Api_Open_Service.DTOs
{
    public class ActualizarPerfilDto
    {
        public string Nombres { get; set; } = null!;
        public string Apellidos { get; set; } = null!;
        public string Correo { get; set; } = null!;
        public string? ContrasenaActual { get; set; }
        public string? NuevaContrasena { get; set; }
    }
}
