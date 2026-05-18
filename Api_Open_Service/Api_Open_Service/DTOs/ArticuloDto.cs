namespace Api_Open_Service.DTOs
{
    public class ArticuloDto
    {
        public int IdArticulo { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int StockDisponible { get; set; }
    }
}
