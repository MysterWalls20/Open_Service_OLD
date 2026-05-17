using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Compra
{
    public int IdCompra { get; set; }

    public int IdProveedor { get; set; }

    public string NroFacturaProveedor { get; set; } = null!;

    public DateTime FechaCompra { get; set; }

    public decimal TotalCompra { get; set; }

    public DateTime FechaRegistro { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public virtual ICollection<DetalleCompra> DetalleCompras { get; set; } = new List<DetalleCompra>();

    public virtual Proveedor IdProveedorNavigation { get; set; } = null!;
}
