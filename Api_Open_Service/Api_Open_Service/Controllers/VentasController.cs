using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
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
                .ToListAsync();
            return Ok(ventas);
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
            var venta = await _repository.GetByIdAsync(id);
            if (venta == null) return NotFound(new { mensaje = "Venta no encontrada." });
            _repository.Remove(venta);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Venta eliminada correctamente." });
        }
    }
}
