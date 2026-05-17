using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Articulo
{
    public int IdArticulo { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public decimal Precio { get; set; }

    public int StockDisponible { get; set; }

    public virtual ICollection<DetalleCompra> DetalleCompras { get; set; } = new List<DetalleCompra>();

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();

    public virtual Producto? Producto { get; set; }

    public virtual Repuesto? Repuesto { get; set; }
}
