using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepuestosController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context;

        public RepuestosController(IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var repuestos = await _context.Repuestos
                .Include(r => r.IdArticuloNavigation)
                .ToListAsync();
            return Ok(repuestos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var repuesto = await _context.Repuestos
                .Include(r => r.IdArticuloNavigation)
                .FirstOrDefaultAsync(r => r.IdArticulo == id);

            if (repuesto == null) return NotFound(new { mensaje = "Repuesto no encontrado." });
            return Ok(repuesto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RepuestoDto dto)
        {
            // 1. Validar que el artículo exista en el Inventario General (Articulo)
            var articuloExiste = await _context.Set<Articulo>().FindAsync(dto.IdArticulo);
            if (articuloExiste == null)
                return BadRequest(new { mensaje = "El ID de Artículo no existe en el Inventario. Créelo primero." });

            // 2. Validar que no se haya registrado ya como repuesto
            var yaEsRepuesto = await _context.Set<Repuesto>().FindAsync(dto.IdArticulo);
            if (yaEsRepuesto != null)
                return BadRequest(new { mensaje = "Este artículo ya está clasificado como repuesto." });

            var nuevoRepuesto = new Repuesto
            {
                IdArticulo = dto.IdArticulo,
                CompatibilidadMarca = dto.CompatibilidadMarca ?? "Genérico"
            };

            await _context.Set<Repuesto>().AddAsync(nuevoRepuesto);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Artículo clasificado como repuesto exitosamente." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] RepuestoDto dto)
        {
            if (id != dto.IdArticulo) return BadRequest(new { mensaje = "El ID no coincide." });

            var existing = await _context.Set<Repuesto>().FindAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Repuesto no encontrado." });

            existing.CompatibilidadMarca = dto.CompatibilidadMarca ?? "Genérico";

            _context.Set<Repuesto>().Update(existing);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Compatibilidad actualizada correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var repuesto = await _context.Set<Repuesto>().FindAsync(id);
            if (repuesto == null) return NotFound(new { mensaje = "Repuesto no encontrado." });

            // Solo borramos su clasificación de 'Repuesto'. 
            // ¡NO borramos el 'Articulo'! Así sigue existiendo en el inventario y puede venderse como Producto.
            _context.Set<Repuesto>().Remove(repuesto);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Clasificación de repuesto eliminada. El artículo sigue en el inventario." });
        }
    }
}
