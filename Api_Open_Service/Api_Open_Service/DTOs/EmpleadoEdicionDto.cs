namespace Api_Open_Service.DTOs
{
    public class EmpleadoEdicionDto
    {
        public int Id { get; set; } // Necesitamos el ID para saber a quién editar
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Correo { get; set; }
        public int IdRol { get; set; }
        public bool Estado { get; set; }
    }
}
