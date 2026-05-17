using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class TipoPago
{
    public int IdTipoPago { get; set; }

    public string Descripcion { get; set; } = null!;

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
