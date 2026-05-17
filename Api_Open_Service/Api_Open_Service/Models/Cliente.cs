using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class Cliente
{
    public int IdCliente { get; set; }

    public string Nombres { get; set; } = null!;

    public string Apellidos { get; set; } = null!;

    public string Correo { get; set; } = null!;

    public string Direccion { get; set; } = null!;

    public string Telefono { get; set; } = null!;

    public virtual ICollection<PedidoTicket> PedidoTickets { get; set; } = new List<PedidoTicket>();

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
