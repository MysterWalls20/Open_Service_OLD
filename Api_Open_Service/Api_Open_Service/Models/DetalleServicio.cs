using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class DetalleServicio
{
    public int IdDetalleServicio { get; set; }

    public int IdServicio { get; set; }

    public string DescripcionTarea { get; set; } = null!;

    public decimal CostoManoObra { get; set; }

    public virtual ServicioOrden IdServicioNavigation { get; set; } = null!;
}
