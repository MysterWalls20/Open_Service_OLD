namespace Api_Open_Service.DTOs
{
    public class EmpleadoListadoDto
    {
        public int Id { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Email { get; set; }
        public string Usuario { get; set; }
        public string RolNombre { get; set; }
        public bool Estado { get; set; }
    }
}
