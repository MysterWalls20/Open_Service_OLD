namespace Api_Open_Service.DTOs
{
    public class ServicioDTO
    {
        public int IdPedido { get; set; }
        public int IdEmpleado { get; set; }
        public string? DiagnosticoTecnico { get; set; }
        public decimal TotalServicio { get; set; }
        public string Estado { get; set; } = "Activo";
        public string? HoraInicio { get; set; }
        public string? HoraFin { get; set; }
        public DateTime? FechaServicio { get; set; }
        public List<DetalleServicioDTO>? Detalles { get; set; }
        public List<ConsumoRepuestoDTO>? ConsumoRepuestos { get; set; }
    }
}
