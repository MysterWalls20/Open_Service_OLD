using System;
using System.Collections.Generic;

namespace Api_Open_Service.DTOs
{
    public class CompraRegistroDto
    {
        public int IdProveedor { get; set; }
        public string NroFacturaProveedor { get; set; } = null!;
        public DateTime FechaCompra { get; set; }

        // ¡Aquí recibimos la lista de todos los productos de esa compra!
        public List<DetalleCompraDto> Detalles { get; set; } = new List<DetalleCompraDto>();
    }
}
