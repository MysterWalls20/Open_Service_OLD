namespace Api_Open_Service.DTOs
{
    public class ProductoRegistroDto
    {
        public int IdArticulo { get; set; }
        public int IdCategoria { get; set; }
        public string CategoriaMarketplace { get; set; } = string.Empty;
        public string UrlImagen { get; set; } = string.Empty;
    }
}
