using Api_Open_Service.Data;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComprobantesController : ControllerBase
    {
        private readonly OpenServiceDbContext _context;

        public ComprobantesController(OpenServiceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var comprobantes = await _context.Comprobantes
                .Include(c => c.IdVentaNavigation)
                    .ThenInclude(v => v.IdClienteNavigation)
                .Include(c => c.IdVentaNavigation)
                    .ThenInclude(v => v.DetalleVenta)
                        .ThenInclude(d => d.IdArticuloNavigation)
                .Include(c => c.IdVentaNavigation)
                    .ThenInclude(v => v.IdTipoPagoNavigation)
                .OrderByDescending(c => c.IdVentaNavigation.FechaVenta)
                .ToListAsync();

            var result = comprobantes.Select(c => new
            {
                idComprobante = c.IdComprobante,
                idVenta = c.IdVenta,
                tipoDocumento = c.TipoDocumento,
                serie = c.Serie,
                correlativo = c.Correlativo,
                subTotal = c.SubTotal,
                montoIgv = c.MontoIgv,
                total = c.SubTotal + c.MontoIgv,
                venta = new
                {
                    idVenta = c.IdVentaNavigation.IdVenta,
                    fechaVenta = c.IdVentaNavigation.FechaVenta,
                    montoTotal = c.IdVentaNavigation.MontoTotal,
                    origenVenta = c.IdVentaNavigation.OrigenVenta,
                    tipoComprobante = c.IdVentaNavigation.TipoComprobante,
                    cliente = c.IdVentaNavigation.IdClienteNavigation == null ? null : new
                    {
                        idCliente = c.IdVentaNavigation.IdClienteNavigation.IdCliente,
                        nombres = c.IdVentaNavigation.IdClienteNavigation.Nombres,
                        apellidos = c.IdVentaNavigation.IdClienteNavigation.Apellidos,
                        correo = c.IdVentaNavigation.IdClienteNavigation.Correo
                    },
                    tipoPago = c.IdVentaNavigation.IdTipoPagoNavigation == null ? null : new
                    {
                        idTipoPago = c.IdVentaNavigation.IdTipoPagoNavigation.IdTipoPago,
                        descripcion = c.IdVentaNavigation.IdTipoPagoNavigation.Descripcion
                    },
                    detalles = c.IdVentaNavigation.DetalleVenta.Select(d => new
                    {
                        idDetalle = d.IdDetalleVenta,
                        idArticulo = d.IdArticulo,
                        articulo = d.IdArticuloNavigation?.Nombre ?? "Sin nombre",
                        cantidad = d.Cantidad,
                        precioUnitario = d.PrecioUnitarioVenta,
                        subtotal = d.SubtotalVenta
                    })
                }
            });

            return Ok(result);
        }
    }
}
