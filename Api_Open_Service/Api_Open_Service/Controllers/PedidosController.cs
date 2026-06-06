using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context;

        public PedidosController(IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        // ==========================================
        // OBTENER TODOS LOS PEDIDOS / TICKETS
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var pedidos = await _context.PedidoTickets
                .Include(p => p.IdClienteNavigation)
                .Include(p => p.IdMarcaNavigation)
                .ToListAsync();
            return Ok(pedidos);
        }

        // ==========================================
        // OBTENER TICKET POR ID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (pedido == null) return NotFound(new { mensaje = "Pedido no encontrado." });
            return Ok(pedido);
        }

        // ==========================================
        // OBTENER HISTORIAL DE UN CLIENTE
        // ==========================================
        [HttpGet("cliente/{idCliente}")]
        public async Task<IActionResult> ObtenerPedidosPorCliente(int idCliente)
        {
            var pedidos = await _unitOfWork.Pedidos.FindAsync(p => p.IdCliente == idCliente);
            return Ok(pedidos);
        }

        // ==========================================
        // CREAR TICKET (PANEL DE ADMINISTRACIÓN)
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PedidoRegistroDto dto)
        {
            var cliente = await _unitOfWork.Clientes.GetByIdAsync(dto.IdCliente);
            if (cliente == null) return BadRequest(new { mensaje = "El cliente no existe." });

            var nuevoPedido = new PedidoTicket
            {
                IdCliente = dto.IdCliente,
                IdMarca = dto.IdMarca,
                Electrodomestico = dto.Electrodomestico,
                Modelo = dto.Modelo,
                Descripcion = dto.Descripcion,
                UrlImagenAdjunta = dto.UrlImagenAdjunta,
                TipoDeServicio = dto.TipoDeServicio ?? "Reparacion",
                Estado = "Pendiente",
                FechaSolicitud = DateTime.Now,
                FechaRegistro = DateTime.Now
            };

            await _unitOfWork.Pedidos.AddAsync(nuevoPedido);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Ticket generado correctamente.", idPedido = nuevoPedido.IdPedido });
        }

        // ==========================================
        // CREAR TICKET PÚBLICO (DESDE LA LANDING)
        // ==========================================
        [HttpPost("ticket-publico")]
        public async Task<IActionResult> CrearTicketPublico([FromBody] TicketPublicoRegistroDto dto)
        {
            var clientes = await _unitOfWork.Clientes.FindAsync(c => c.Correo == dto.Correo);
            var cliente = clientes.FirstOrDefault();

            if (cliente == null)
            {
                cliente = new Cliente { Nombres = dto.Nombres, Apellidos = dto.Apellidos, Correo = dto.Correo, Telefono = dto.Telefono, Direccion = dto.Direccion };
                await _unitOfWork.Clientes.AddAsync(cliente);
                await _unitOfWork.SaveAsync();
            }

            var marcas = await _unitOfWork.Marcas.FindAsync(m => m.NombreMarca == dto.NombreMarca);
            var marca = marcas.FirstOrDefault();

            if (marca == null)
            {
                marca = new Marca { NombreMarca = dto.NombreMarca };
                await _unitOfWork.Marcas.AddAsync(marca);
                await _unitOfWork.SaveAsync();
            }

            var nuevoPedido = new PedidoTicket
            {
                IdCliente = cliente.IdCliente,
                IdMarca = marca.IdMarca,
                Electrodomestico = dto.Electrodomestico,
                Modelo = dto.Modelo,
                Descripcion = dto.Descripcion,
                TipoDeServicio = dto.TipoDeServicio ?? "Reparacion",
                Estado = "Pendiente",
                FechaSolicitud = DateTime.Now,
                FechaRegistro = DateTime.Now
            };

            await _unitOfWork.Pedidos.AddAsync(nuevoPedido);
            await _unitOfWork.SaveAsync();

            var historial = new HistorialTicket
            {
                IdPedido = nuevoPedido.IdPedido,
                EstadoAnterior = "Ninguno",
                EstadoNuevo = "Pendiente",
                FechaCambio = DateTime.Now,
                Observacion = "Ticket creado automáticamente por el cliente desde el portal web público."
            };
            _context.Set<HistorialTicket>().Add(historial);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Ticket generado correctamente.", idPedido = nuevoPedido.IdPedido });
        }

        // ==========================================
        // ACTUALIZAR COMPLETO (EDITAR PEDIDO)
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PedidoEdicionDto dto)
        {
            var existing = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Pedido no encontrado." });

            // Solo actualizamos los textos. El estado NO se toca por aquí.
            existing.Descripcion = dto.Descripcion;
            existing.Electrodomestico = dto.Electrodomestico;
            existing.Modelo = dto.Modelo;
            existing.FechaModificacion = DateTime.Now;

            _unitOfWork.Pedidos.Update(existing);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Pedido actualizado correctamente." });
        }

        // ==========================================
        // CAMBIO RÁPIDO DE ESTADO
        // ==========================================
        [HttpPut("{id}/estado")]
        public async Task<IActionResult> UpdateEstado(int id, [FromBody] EstadoDto dto)
        {
            var existing = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Pedido no encontrado." });

            if (existing.Estado != dto.Estado)
            {
                _context.Set<HistorialTicket>().Add(new HistorialTicket
                {
                    IdPedido = existing.IdPedido,
                    EstadoAnterior = existing.Estado,
                    EstadoNuevo = dto.Estado,
                    FechaCambio = DateTime.Now,
                    Observacion = "Cambio rápido de estado desde los controles de la tabla."
                });
            }

            existing.Estado = dto.Estado;
            existing.FechaModificacion = DateTime.Now;

            _unitOfWork.Pedidos.Update(existing);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Estado del pedido actualizado." });
        }

        // ==========================================
        // ELIMINAR PEDIDO (CON EL FIX DE LLAVE FORÁNEA)
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (pedido == null) return NotFound(new { mensaje = "Pedido no encontrado." });

            var historialesDelPedido = await _context.Set<HistorialTicket>().Where(h => h.IdPedido == id).ToListAsync();
            if (historialesDelPedido.Any())
            {
                _context.Set<HistorialTicket>().RemoveRange(historialesDelPedido);
                await _unitOfWork.SaveAsync();
            }

            _unitOfWork.Pedidos.Remove(pedido);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Pedido y su historial eliminados correctamente de la base de datos." });
        }
    }

}