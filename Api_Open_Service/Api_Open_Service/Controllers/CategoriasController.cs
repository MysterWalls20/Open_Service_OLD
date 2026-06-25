using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Api_Open_Service.DTOs;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly OpenServiceDbContext _context;

        public CategoriasController(OpenServiceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categorias = await _context.Set<Categorium>().ToListAsync();
            return Ok(categorias);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var categoria = await _context.Set<Categorium>().FindAsync(id);
            if (categoria == null) return NotFound(new { mensaje = "Categoría no encontrada." });
            return Ok(categoria);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoriaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NombreCategoria))
                return BadRequest(new { mensaje = "El nombre de la categoría es obligatorio." });

            var nuevaCategoria = new Categorium { NombreCategoria = dto.NombreCategoria };
            _context.Set<Categorium>().Add(nuevaCategoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = nuevaCategoria.IdCategoria }, nuevaCategoria);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoriaDto dto)
        {
            var categoria = await _context.Set<Categorium>().FindAsync(id);
            if (categoria == null) return NotFound(new { mensaje = "Categoría no encontrada." });

            categoria.NombreCategoria = dto.NombreCategoria;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Categoría actualizada correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var categoria = await _context.Set<Categorium>().FindAsync(id);
            if (categoria == null) return NotFound(new { mensaje = "Categoría no encontrada." });

            // Protección de llave foránea: Verificar si hay productos usando esta categoría
            // Descomenta esto si tienes el DbSet de Productos configurado:
            // var tieneProductos = await _context.Set<Producto>().AnyAsync(p => p.IdCategoria == id);
            // if (tieneProductos) return BadRequest(new { mensaje = "No puedes eliminar esta categoría porque tiene productos asignados." });

            _context.Set<Categorium>().Remove(categoria);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Categoría eliminada correctamente." });
        }
    }
}