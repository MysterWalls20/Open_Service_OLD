using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class ConsumoRepuesto
{
    public int IdConsumo { get; set; }

    public int IdServicio { get; set; }

    public int IdArticulo { get; set; }

    public int Cantidad { get; set; }

    public decimal Subtotal { get; set; }

    public virtual Repuesto IdArticuloNavigation { get; set; } = null!;

    public virtual ServicioOrden IdServicioNavigation { get; set; } = null!;
}
