using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Repuesto
{
    public int IdArticulo { get; set; }

    public string CompatibilidadMarca { get; set; } = null!;

    public virtual ICollection<ConsumoRepuesto> ConsumoRepuestos { get; set; } = new List<ConsumoRepuesto>();

    public virtual Articulo IdArticuloNavigation { get; set; } = null!;
}
