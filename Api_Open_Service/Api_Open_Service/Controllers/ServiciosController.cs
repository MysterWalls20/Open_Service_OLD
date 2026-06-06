using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Api_Open_Service.DTOs;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiciosController : ControllerBase
    {
        private readonly IRepository<ServicioOrden> _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context;

        public ServiciosController(IRepository<ServicioOrden> repository, IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _context = context;
        }

        // ==========================================
        // OBTENER TODAS LAS ÓRDENES DE SERVICIO
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var servicios = await _context.ServicioOrdens
                .Include(s => s.IdEmpleadoNavigation)
                .Include(s => s.IdPedidoNavigation)
                    .ThenInclude(p => p.IdClienteNavigation)
                .Include(s => s.DetalleServicios)
                .Include(s => s.ConsumoRepuestos)
                .ToListAsync();
            return Ok(servicios);
        }

        // ==========================================
        // OBTENER ÓRDEN DE SERVICIO POR ID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var servicio = await _context.ServicioOrdens
                .Include(s => s.IdEmpleadoNavigation)
                .Include(s => s.IdPedidoNavigation)
                .Include(s => s.DetalleServicios)
                .Include(s => s.ConsumoRepuestos)
                .FirstOrDefaultAsync(s => s.IdServicio == id);

            if (servicio == null) return NotFound(new { mensaje = "Servicio no encontrado." });
            return Ok(servicio);
        }

        // ==========================================
        // CREAR SERVICIO (FORZADO A "EN PROCESO")
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ServicioDTO dto)
        {
            try
            {
                // 1. VALIDACIÓN ANTIBALAS: ¿Existe el Ticket?
                var pedido = await _context.Set<PedidoTicket>().FindAsync(dto.IdPedido);
                if (pedido == null) return BadRequest(new { mensaje = $"El Ticket ID {dto.IdPedido} no existe." });

                // 2. VALIDACIÓN ANTIBALAS: ¿Existe el Técnico?
                var empleado = await _context.Set<Empleado>().FindAsync(dto.IdEmpleado);
                if (empleado == null) return BadRequest(new { mensaje = $"El Técnico ID {dto.IdEmpleado} no existe en la base de datos." });

                // 3. FORZAMOS EL ESTADO INICIAL
                string nuevoEstadoServicio = "Activo";
                string nuevoEstadoPedido = "En proceso";

                // Cambiamos el estado del pedido
                string estadoAnterior = pedido.Estado;
                pedido.Estado = nuevoEstadoPedido;
                pedido.FechaModificacion = DateTime.Now;

                // Agregamos el historial del ticket
                var historial = new HistorialTicket
                {
                    IdPedido = pedido.IdPedido,
                    EstadoAnterior = estadoAnterior,
                    EstadoNuevo = nuevoEstadoPedido,
                    FechaCambio = DateTime.Now,
                    Observacion = $"Orden asignada e iniciada por el Técnico: {empleado.Nombres} {empleado.Apellidos}."
                };
                _context.Set<HistorialTicket>().Add(historial);

                // Creamos la Orden de Servicio
                var nuevoServicio = new ServicioOrden
                {
                    IdPedido = dto.IdPedido,
                    IdEmpleado = dto.IdEmpleado,
                    DiagnosticoTecnico = dto.DiagnosticoTecnico ?? "Sin diagnóstico inicial",
                    TotalServicio = dto.TotalServicio,
                    Estado = nuevoEstadoServicio, // Se guarda como "En proceso"
                    FechaServicio = dto.FechaServicio ?? DateTime.Now,
                    HoraInicio = dto.HoraInicio != null ? TimeOnly.Parse(dto.HoraInicio) : TimeOnly.FromDateTime(DateTime.Now),
                    HoraFin = dto.HoraFin != null ? TimeOnly.Parse(dto.HoraFin) : null
                };

                await _repository.AddAsync(nuevoServicio);
                await _unitOfWork.SaveAsync(); // Guardamos cabecera

                // Guardamos DetalleServicio
                if (dto.Detalles != null && dto.Detalles.Count > 0)
                {
                    foreach (var det in dto.Detalles)
                    {
                        _context.Set<DetalleServicio>().Add(new DetalleServicio
                        {
                            IdServicio = nuevoServicio.IdServicio,
                            DescripcionTarea = det.DescripcionTarea,
                            CostoManoObra = det.CostoManoObra
                        });
                    }
                    await _unitOfWork.SaveAsync();
                }

                // Guardamos ConsumoRepuesto y Restamos Inventario
                if (dto.ConsumoRepuestos != null && dto.ConsumoRepuestos.Count > 0)
                {
                    foreach (var rep in dto.ConsumoRepuestos)
                    {
                        _context.Set<ConsumoRepuesto>().Add(new ConsumoRepuesto
                        {
                            IdServicio = nuevoServicio.IdServicio,
                            IdArticulo = rep.IdArticulo,
                            Cantidad = rep.Cantidad,
                            Subtotal = rep.Subtotal
                        });

                        // Descuento automático de Stock
                        var articulo = await _context.Set<Articulo>().FindAsync(rep.IdArticulo);
                        if (articulo != null) articulo.StockDisponible -= rep.Cantidad;
                    }
                    await _unitOfWork.SaveAsync();
                }

                return Ok(new { mensaje = "Orden creada con éxito. Estado: En proceso." });
            }
            catch (Exception ex)
            {
                string errorReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { mensaje = "Error en Base de Datos", detalle = errorReal });
            }
        }

        // ==========================================
        // ELIMINAR ÓRDEN DE SERVICIO
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var servicio = await _context.Set<ServicioOrden>().FindAsync(id);
                if (servicio == null) return NotFound(new { mensaje = "Servicio no encontrado." });

                // 1. DEVOLVER INVENTARIO Y DESTRUIR LOS REGISTROS DE REPUESTOS
                var repuestosExistentes = await _context.Set<ConsumoRepuesto>().Where(r => r.IdServicio == id).ToListAsync();
                foreach (var rep in repuestosExistentes)
                {
                    var articulo = await _context.Set<Articulo>().FindAsync(rep.IdArticulo);
                    if (articulo != null) articulo.StockDisponible += rep.Cantidad;
                }
                _context.Set<ConsumoRepuesto>().RemoveRange(repuestosExistentes); // <--- ¡Esta línea faltaba!

                // 2. DESTRUIR LOS REGISTROS DE MANO DE OBRA / TAREAS
                var detallesExistentes = await _context.Set<DetalleServicio>().Where(d => d.IdServicio == id).ToListAsync();
                _context.Set<DetalleServicio>().RemoveRange(detallesExistentes);  // <--- ¡Esta también faltaba!

                // 3. CAMBIAR EL ESTADO DEL TICKET A ANULADO
                var pedido = await _context.Set<PedidoTicket>().FindAsync(servicio.IdPedido);
                if (pedido != null)
                {
                    string estadoAnterior = pedido.Estado;
                    pedido.Estado = "Anulado"; // Cambiado a Anulado según tu preferencia
                    pedido.FechaModificacion = DateTime.Now;

                    _context.Set<HistorialTicket>().Add(new HistorialTicket
                    {
                        IdPedido = pedido.IdPedido,
                        EstadoAnterior = estadoAnterior,
                        EstadoNuevo = "Anulado",
                        FechaCambio = DateTime.Now,
                        Observacion = "Orden de servicio eliminada por la administración. El ticket fue Anulado."
                    });
                }

                // 4. FINALMENTE, BORRAMOS EL SERVICIO PADRE
                _context.Set<ServicioOrden>().Remove(servicio);
                await _unitOfWork.SaveAsync();

                return Ok(new { mensaje = "Orden y detalles eliminados con éxito. Inventario devuelto a almacén." });
            }
            catch (Exception ex)
            {
                string errorReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { mensaje = "Error al eliminar la orden de servicio", detalle = errorReal });
            }
        }
    }
}