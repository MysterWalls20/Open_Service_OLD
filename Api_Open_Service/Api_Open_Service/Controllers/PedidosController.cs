using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly IRepository<PedidoTicket> _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context;

        public PedidosController(IRepository<PedidoTicket> repository, IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var pedidos = await _context.PedidoTickets
                .Include(p => p.IdClienteNavigation)
                .Include(p => p.IdMarcaNavigation)
                .ToListAsync();
            return Ok(pedidos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pedido = await _repository.GetByIdAsync(id);
            if (pedido == null) return NotFound(new { mensaje = "Pedido no encontrado." });
            return Ok(pedido);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PedidoTicket pedido)
        {
            await _repository.AddAsync(pedido);
            await _unitOfWork.SaveAsync();
            return CreatedAtAction(nameof(GetById), new { id = pedido.IdPedido }, pedido);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PedidoTicket pedido)
        {
            if (id != pedido.IdPedido) return BadRequest(new { mensaje = "El ID no coincide." });
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Pedido no encontrado." });
            _repository.Update(pedido);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Pedido actualizado correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pedido = await _repository.GetByIdAsync(id);
            if (pedido == null) return NotFound(new { mensaje = "Pedido no encontrado." });
            _repository.Remove(pedido);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Pedido eliminado correctamente." });
        }
    }
}
