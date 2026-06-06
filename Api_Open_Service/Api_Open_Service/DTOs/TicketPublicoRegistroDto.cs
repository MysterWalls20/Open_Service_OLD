namespace Api_Open_Service.DTOs
{
    public class TicketPublicoRegistroDto
    {
        public string Nombres { get; set; } = null!;
        public string Apellidos { get; set; } = null!;
        public string Correo { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public string Direccion { get; set; } = null!;
        public string NombreMarca { get; set; } = null!;
        public string Electrodomestico { get; set; } = null!;
        public string Modelo { get; set; } = null!;
        public string Descripcion { get; set; } = null!;
        public string? TipoDeServicio { get; set; }
        public string? UrlImagenAdjunta { get; set; }
    }
}
