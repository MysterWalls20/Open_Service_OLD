using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Empleado
{
    public int IdEmpleado { get; set; }

    public string Nombres { get; set; } = null!;

    public string Apellidos { get; set; } = null!;

    public int IdRol { get; set; }

    public virtual Usuario IdEmpleadoNavigation { get; set; } = null!;

    public virtual Rol IdRolNavigation { get; set; } = null!;

    public virtual ICollection<ServicioOrden> ServicioOrdens { get; set; } = new List<ServicioOrden>();
}
