using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class ServicioOrden
{
    public int IdServicio { get; set; }

    public int IdPedido { get; set; }

    public int IdEmpleado { get; set; }

    public string? DiagnosticoTecnico { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaServicio { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly? HoraFin { get; set; }

    public decimal TotalServicio { get; set; }

    public virtual ICollection<ConsumoRepuesto> ConsumoRepuestos { get; set; } = new List<ConsumoRepuesto>();

    public virtual ICollection<DetalleServicio> DetalleServicios { get; set; } = new List<DetalleServicio>();

    public virtual Empleado IdEmpleadoNavigation { get; set; } = null!;

    public virtual PedidoTicket IdPedidoNavigation { get; set; } = null!;

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
