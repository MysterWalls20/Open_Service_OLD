namespace Api_Open_Service.DTOs
{
    public class CheckoutDto
    {
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public int IdTipoPago { get; set; }
        public decimal MontoTotal { get; set; }

        public string OrigenVenta { get; set; } = "Marketplace";
        public int? IdServicio { get; set; }

        public List<ItemCarritoDto> Items { get; set; } = new List<ItemCarritoDto>();
    }
}
