using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly IRepository<Producto> _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context;

        public ProductosController(IRepository<Producto> repository, IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var productos = await _context.Productos
                .Include(p => p.IdArticuloNavigation)
                .Include(p => p.IdCategoriaNavigation)
                .ToListAsync();
            return Ok(productos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var producto = await _repository.GetByIdAsync(id);
            if (producto == null) return NotFound(new { mensaje = "Producto no encontrado." });
            return Ok(producto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Producto producto)
        {
            await _repository.AddAsync(producto);
            await _unitOfWork.SaveAsync();
            return CreatedAtAction(nameof(GetById), new { id = producto.IdArticulo }, producto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Producto producto)
        {
            if (id != producto.IdArticulo) return BadRequest(new { mensaje = "El ID no coincide." });
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Producto no encontrado." });
            _repository.Update(producto);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Producto actualizado correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var producto = await _repository.GetByIdAsync(id);
            if (producto == null) return NotFound(new { mensaje = "Producto no encontrado." });
            _repository.Remove(producto);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Producto eliminado correctamente." });
        }
    }
}
