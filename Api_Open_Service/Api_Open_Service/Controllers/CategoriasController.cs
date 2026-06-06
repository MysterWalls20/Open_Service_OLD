using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

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
            // Ojo: Si tu modelo en C# se llama Categoria en vez de Categorium, cámbialo aquí
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
    }
}