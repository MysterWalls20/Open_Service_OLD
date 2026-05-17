using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Comprobante
{
    public int IdComprobante { get; set; }

    public int IdVenta { get; set; }

    public string TipoDocumento { get; set; } = null!;

    public string Serie { get; set; } = null!;

    public string Correlativo { get; set; } = null!;

    public decimal SubTotal { get; set; }

    public decimal MontoIgv { get; set; }

    public virtual Ventum IdVentaNavigation { get; set; } = null!;
}
