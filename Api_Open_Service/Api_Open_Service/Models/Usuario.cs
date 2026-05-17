using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string Usuario1 { get; set; } = null!;

    public string Correo { get; set; } = null!;

    public string ContrasenaHash { get; set; } = null!;

    public bool Estado { get; set; }

    public virtual Empleado? Empleado { get; set; }
}
