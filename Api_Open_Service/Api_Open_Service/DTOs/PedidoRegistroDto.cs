namespace Api_Open_Service.DTOs
{
    public class PedidoRegistroDto
    {
        public int IdCliente { get; set; }
        public int IdMarca { get; set; }
        public string Electrodomestico { get; set; } = null!; // Ej: Lavadora
        public string Modelo { get; set; } = null!;
        public string Descripcion { get; set; } = null!;
        public string TipoDeServicio { get; set; } = "Reparacion";
        public string? UrlImagenAdjunta { get; set; } // La URL de Firebase
    }
}
