using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Marca
{
    public int IdMarca { get; set; }

    public string NombreMarca { get; set; } = null!;

    public virtual ICollection<PedidoTicket> PedidoTickets { get; set; } = new List<PedidoTicket>();
}
