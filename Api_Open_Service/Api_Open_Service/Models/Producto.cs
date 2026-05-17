using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Producto
{
    public int IdArticulo { get; set; }

    public string CategoriaMarketplace { get; set; } = null!;

    public string? UrlImagen { get; set; }

    public int IdCategoria { get; set; }

    public virtual Articulo IdArticuloNavigation { get; set; } = null!;

    public virtual Categorium IdCategoriaNavigation { get; set; } = null!;
}
