using System;
using System.Collections.Generic;

namespace Api_Open_Service.Models;

public partial class PedidoTicket
{
    public int IdPedido { get; set; }

    public string Descripcion { get; set; } = null!;

    public string Electrodomestico { get; set; } = null!;

    public string Modelo { get; set; } = null!;

    public string TipoDeServicio { get; set; } = null!;

    public string? UrlImagenAdjunta { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaSolicitud { get; set; }

    public int IdCliente { get; set; }

    public int IdMarca { get; set; }

    public DateTime FechaRegistro { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public virtual ICollection<HistorialTicket> HistorialTickets { get; set; } = new List<HistorialTicket>();

    public virtual Cliente IdClienteNavigation { get; set; } = null!;

    public virtual Marca IdMarcaNavigation { get; set; } = null!;

    public virtual ServicioOrden? ServicioOrden { get; set; }
}
