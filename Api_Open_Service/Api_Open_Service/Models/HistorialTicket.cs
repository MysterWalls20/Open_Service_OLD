using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class HistorialTicket
{
    public int IdHistorial { get; set; }

    public int IdPedido { get; set; }

    public string EstadoAnterior { get; set; } = null!;

    public string EstadoNuevo { get; set; } = null!;

    public DateTime FechaCambio { get; set; }

    public string? Observacion { get; set; }

    public virtual PedidoTicket IdPedidoNavigation { get; set; } = null!;
}
