using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var servicios = await _context.ServicioOrdens
                .Include(s => s.IdEmpleadoNavigation)
                .Include(s => s.IdPedidoNavigation)
                .ToListAsync();
            return Ok(servicios);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var servicio = await _repository.GetByIdAsync(id);
            if (servicio == null) return NotFound(new { mensaje = "Servicio no encontrado." });
            return Ok(servicio);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ServicioOrden servicio)
        {
            await _repository.AddAsync(servicio);
            await _unitOfWork.SaveAsync();
            return CreatedAtAction(nameof(GetById), new { id = servicio.IdServicio }, servicio);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ServicioOrden servicio)
        {
            if (id != servicio.IdServicio) return BadRequest(new { mensaje = "El ID no coincide." });
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Servicio no encontrado." });
            _repository.Update(servicio);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Servicio actualizado correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var servicio = await _repository.GetByIdAsync(id);
            if (servicio == null) return NotFound(new { mensaje = "Servicio no encontrado." });
            _repository.Remove(servicio);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Servicio eliminado correctamente." });
        }
    }
}
