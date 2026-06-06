using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Ventum
{
    public int IdVenta { get; set; }

    public int IdCliente { get; set; }

    public int IdTipoPago { get; set; }

    public int? IdServicio { get; set; }

    public DateTime FechaVenta { get; set; }

    public decimal MontoTotal { get; set; }

    public string OrigenVenta { get; set; } = null!;

    public string TipoComprobante { get; set; } = null!;

    public DateTime FechaRegistro { get; set; }

    public DateTime? FechaModificacion { get; set; }
    public decimal MontoIGV { get; set; }

    public virtual Comprobante? Comprobante { get; set; }

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();

    public virtual Cliente IdClienteNavigation { get; set; } = null!;

    public virtual ServicioOrden? IdServicioNavigation { get; set; }

    public virtual TipoPago IdTipoPagoNavigation { get; set; } = null!;
}
