using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Categorium
{
    public int IdCategoria { get; set; }

    public string NombreCategoria { get; set; } = null!;

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
