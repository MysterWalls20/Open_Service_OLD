using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Api_Open_Service.Services.Strategy;
using Api_Open_Service.Services.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly IRepository<Ventum> _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context;

        public VentasController(IRepository<Ventum> repository, IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var ventas = await _context.Venta
                .Include(v => v.IdClienteNavigation)
                .Include(v => v.IdTipoPagoNavigation)
                .OrderByDescending(v => v.FechaVenta)
                .ToListAsync();

            var result = ventas.Select(v => new {
                idVenta = v.IdVenta,
                montoTotal = v.MontoTotal,
                igv = v.MontoIGV, // <--- ESTO ES VITAL PARA QUE ANGULAR LO VEA
                fechaVenta = v.FechaVenta,
                origenVenta = v.OrigenVenta,
                tipoComprobante = v.TipoComprobante,
                idClienteNavigation = new
                {
                    nombres = v.IdClienteNavigation?.Nombres,
                    apellidos = v.IdClienteNavigation?.Apellidos
                },
                idTipoPagoNavigation = new
                {
                    descripcion = v.IdTipoPagoNavigation?.Descripcion
                }
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var venta = await _repository.GetByIdAsync(id);
            if (venta == null) return NotFound(new { mensaje = "Venta no encontrada." });
            return Ok(venta);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Ventum venta)
        {
            await _repository.AddAsync(venta);
            await _unitOfWork.SaveAsync();
            return CreatedAtAction(nameof(GetById), new { id = venta.IdVenta }, venta);
        }


        [HttpPost("checkout")]
        public async Task<IActionResult> ProcesarCheckout([FromBody] CheckoutDto request)
        {
            // ========================================================
            // 1. APLICAMOS PATRÓN STRATEGY (Para procesar el pago)
            // ========================================================
            IEstrategiaPago estrategiaSeleccionada = request.IdTipoPago switch
            {
                1 => new PagoEfectivoStrategy(),
                2 => new PagoYapeStrategy(),
                3 => new PagoTarjetaStrategy(),
                _ => new PagoEfectivoStrategy()
            };

            var contextoPago = new ContextoPago(estrategiaSeleccionada);
            string conceptoCobro = $"Operación en {Singleton.Instancia.NombreEmpresa}";

            bool pagoAprobado = contextoPago.EjecutarPago(request.MontoTotal, conceptoCobro);
            if (!pagoAprobado) return BadRequest(new { mensaje = "El pago fue rechazado." });


            // ========================================================
            // 2. APLICAMOS PATRÓN SINGLETON (Para calcular el IGV)
            // ========================================================
            decimal porcentajeIgv = Singleton.Instancia.IGV; // Trae el 0.18 de tu clase global

            // Fórmulas matemáticas contables:
            decimal subTotalCalculado = request.MontoTotal / (1 + porcentajeIgv);
            decimal montoIgvCalculado = request.MontoTotal - subTotalCalculado;


            // ========================================================
            // 3. REGISTRO DEL CLIENTE
            // ========================================================
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Correo == request.Correo);
            if (cliente == null)
            {
                cliente = new Cliente
                {
                    Nombres = request.Nombres,
                    Apellidos = request.Apellidos,
                    Correo = request.Correo,
                    Telefono = request.Telefono,
                    Direccion = request.Direccion
                };
                await _context.Clientes.AddAsync(cliente);
                await _context.SaveChangesAsync();
            }


            // ========================================================
            // 4. CREACIÓN DE LA VENTA (Usando los DTOs y el IGV)
            // ========================================================
            var nuevaVenta = new Ventum
            {
                IdCliente = cliente.IdCliente,
                IdTipoPago = request.IdTipoPago,
                FechaVenta = DateTime.Now,
                MontoTotal = request.MontoTotal,

                MontoIGV= montoIgvCalculado, // <--- AQUÍ SE GUARDA EL MONTO DEL IGV EN LA TABLA VENTA

                OrigenVenta = request.OrigenVenta, // "Marketplace" o "Venta Directa" o "Servicio Técnico"
                IdServicio = request.IdServicio,   // Se llena si es de un técnico, sino queda en null

                TipoComprobante = "Boleta",
                FechaRegistro = DateTime.Now
            };
            await _context.Venta.AddAsync(nuevaVenta);
            await _context.SaveChangesAsync(); // Guardamos para que genere el IdVenta


            // ========================================================
            // 5. DETALLES DE VENTA (Solo si trae productos)
            // ========================================================
            if (request.Items != null && request.Items.Any())
            {
                foreach (var item in request.Items)
                {
                    var detalle = new DetalleVentum
                    {
                        IdVenta = nuevaVenta.IdVenta,
                        IdArticulo = item.IdArticulo,
                        Cantidad = item.Cantidad,
                        PrecioUnitarioVenta = item.Precio,
                        SubtotalVenta = item.Cantidad * item.Precio
                    };
                    await _context.DetalleVenta.AddAsync(detalle);

                    // Descontar inventario
                    var articulo = await _context.Articulos.FindAsync(item.IdArticulo);
                    if (articulo != null) articulo.StockDisponible -= item.Cantidad;
                }
            }


            // ========================================================
            // 6. GENERACIÓN DEL COMPROBANTE
            // ========================================================
            var comprobante = new Comprobante
            {
                IdVenta = nuevaVenta.IdVenta,
                TipoDocumento = "Boleta",
                Serie = "B001",
                Correlativo = contextoPago.ObtenerReferencia(), // Ej: YAPE-A1B2C3D4

                SubTotal = Math.Round(subTotalCalculado, 2),    // Redondeado a 2 decimales
                MontoIgv = Math.Round(montoIgvCalculado, 2)     // <--- AQUÍ SE GUARDA EL IGV EN EL COMPROBANTE
            };
            await _context.Comprobantes.AddAsync(comprobante);

            // ========================================================
            // 7. ACTUALIZAR ESTADO DEL SERVICIO A "COMPLETADO"
            // ========================================================
            if (request.IdServicio.HasValue)
            {
                var servicioVinculado = await _context.ServicioOrdens.FindAsync(request.IdServicio.Value);
                if (servicioVinculado != null)
                {
                    servicioVinculado.Estado = "Completado";
                    _context.ServicioOrdens.Update(servicioVinculado);
                }
            }

            // Guardar todo el bloque final
            await _unitOfWork.SaveAsync();

            return Ok(new
            {
                mensaje = "Operación procesada con éxito",
                idVenta = nuevaVenta.IdVenta,
                nroComprobante = $"{comprobante.Serie}-{comprobante.Correlativo}"
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Ventum venta)
        {
            if (id != venta.IdVenta) return BadRequest(new { mensaje = "El ID no coincide." });
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Venta no encontrada." });
            _repository.Update(venta);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Venta actualizada correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var venta = await _context.Venta.FindAsync(id);
            if (venta == null) return NotFound(new { mensaje = "Venta no encontrada." });

            // 1. PRIMERO: DESTRUIR EL COMPROBANTE HUÉRFANO (Esto soluciona tu pantalla roja)
            var comprobante = await _context.Set<Comprobante>().FirstOrDefaultAsync(c => c.IdVenta == id);
            if (comprobante != null)
            {
                _context.Set<Comprobante>().Remove(comprobante);
            }

            // 2. SEGUNDO: DESTRUIR LOS DETALLES Y DEVOLVER STOCK
            var detallesVenta = await _context.Set<DetalleVentum>().Where(d => d.IdVenta == id).ToListAsync();
            if (detallesVenta.Any())
            {
                foreach (var det in detallesVenta)
                {
                    var articulo = await _context.Articulos.FindAsync(det.IdArticulo);
                    if (articulo != null) articulo.StockDisponible += det.Cantidad;
                }
                _context.Set<DetalleVentum>().RemoveRange(detallesVenta);
            }

            // 3. TERCERO: ANULAR EL TICKET DE SERVICIO (Si aplica)
            if (venta.IdServicio.HasValue)
            {
                var servicio = await _context.ServicioOrdens.FindAsync(venta.IdServicio.Value);
                if (servicio != null)
                {
                    servicio.Estado = "Anulado";
                    _context.ServicioOrdens.Update(servicio);

                    var pedido = await _context.Set<PedidoTicket>().FindAsync(servicio.IdPedido);
                    if (pedido != null)
                    {
                        pedido.Estado = "Anulado";
                        pedido.FechaModificacion = DateTime.Now;
                    }
                }
            }

            // 4. FINALMENTE: BORRAR LA VENTA (Ahora SQL Server sí te dejará)
            _context.Venta.Remove(venta);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Venta y Comprobante eliminados correctamente." });
        }
    }
}
