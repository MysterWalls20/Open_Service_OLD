namespace Api_Open_Service.DTOs
{
    public class ProveedorDto
    {
        public int IdProveedor { get; set; }
        public string RazonSocial { get; set; } = null!;
        public string RucContacto { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public string? Email { get; set; }
    }
}
