using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class DetalleVentum
{
    public int IdDetalleVenta { get; set; }

    public int IdVenta { get; set; }

    public int IdArticulo { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitarioVenta { get; set; }

    public decimal SubtotalVenta { get; set; }

    public virtual Articulo IdArticuloNavigation { get; set; } = null!;

    public virtual Ventum IdVentaNavigation { get; set; } = null!;
}
