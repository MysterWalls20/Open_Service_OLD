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
    public class ProductosController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context;

        public ProductosController(IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
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
            var producto = await _context.Productos
                .Include(p => p.IdArticuloNavigation)
                .Include(p => p.IdCategoriaNavigation)
                .FirstOrDefaultAsync(p => p.IdArticulo == id);

            if (producto == null) return NotFound(new { mensaje = "Producto no encontrado." });
            return Ok(producto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductoRegistroDto dto)
        {
            // 1. Validar que el artículo exista en el Inventario General
            var articuloExiste = await _context.Set<Articulo>().FindAsync(dto.IdArticulo);
            if (articuloExiste == null)
                return BadRequest(new { mensaje = "El artículo no existe en el inventario base." });

            // 2. Validar que no esté publicado ya
            var yaPublicado = await _context.Set<Producto>().FindAsync(dto.IdArticulo);
            if (yaPublicado != null)
                return BadRequest(new { mensaje = "Este artículo ya está publicado en el Marketplace." });

            var nuevoProducto = new Producto
            {
                IdArticulo = dto.IdArticulo,
                IdCategoria = dto.IdCategoria,
                CategoriaMarketplace = dto.CategoriaMarketplace ?? "General",
                UrlImagen = dto.UrlImagen
            };

            await _context.Set<Producto>().AddAsync(nuevoProducto);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Producto publicado en el Marketplace." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductoRegistroDto dto)
        {
            var producto = await _context.Set<Producto>().FindAsync(id);
            if (producto == null) return NotFound(new { mensaje = "Producto no encontrado." });

            // Solo actualizamos los campos propios del Marketplace. 
            // Nombre y Precio se editan desde el módulo de Inventario.
            producto.IdCategoria = dto.IdCategoria;
            producto.CategoriaMarketplace = dto.CategoriaMarketplace ?? "General";
            producto.UrlImagen = dto.UrlImagen;

            _context.Set<Producto>().Update(producto);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Datos de publicación actualizados." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var producto = await _context.Set<Producto>().FindAsync(id);
            if (producto == null) return NotFound(new { mensaje = "Producto no encontrado." });

            // Lo quitamos del Marketplace, pero el Articulo sigue en inventario
            _context.Set<Producto>().Remove(producto);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Producto retirado del Marketplace." });
        }
    }
}