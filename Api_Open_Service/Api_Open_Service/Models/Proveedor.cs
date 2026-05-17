using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Proveedor
{
    public int IdProveedor { get; set; }

    public string RazonSocial { get; set; } = null!;

    public string RucContacto { get; set; } = null!;

    public string Telefono { get; set; } = null!;

    public virtual ICollection<Compra> Compras { get; set; } = new List<Compra>();
}
