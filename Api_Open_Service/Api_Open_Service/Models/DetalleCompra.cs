using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class DetalleCompra
{
    public int IdDetalleCompra { get; set; }

    public int IdCompra { get; set; }

    public int IdArticulo { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitarioCompra { get; set; }

    public decimal SubtotalCompra { get; set; }

    public virtual Articulo IdArticuloNavigation { get; set; } = null!;

    public virtual Compra IdCompraNavigation { get; set; } = null!;
}
