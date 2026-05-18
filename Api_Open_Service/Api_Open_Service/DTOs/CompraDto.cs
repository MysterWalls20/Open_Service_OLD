namespace Api_Open_Service.DTOs
{
    public class CompraDto
    {
        public int IdCompra { get; set; }
        public int IdProveedor { get; set; }
        public string NroFacturaProveedor { get; set; } = null!;
        public DateTime FechaCompra { get; set; }
        public decimal TotalCompra { get; set; }
    }
}
