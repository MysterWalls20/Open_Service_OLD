using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventarioController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public InventarioController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var articulos = await _unitOfWork.Articulos.GetAllAsync();
            var dtos = articulos.Select(a => new ArticuloDto
            {
                IdArticulo = a.IdArticulo,
                Nombre = a.Nombre,
                Descripcion = a.Descripcion,
                Precio = a.Precio,
                StockDisponible = a.StockDisponible
            });
            return Ok(dtos);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ArticuloDto dto)
        {
            var nuevoArticulo = new Articulo
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                StockDisponible = dto.StockDisponible
            };
            await _unitOfWork.Articulos.AddAsync(nuevoArticulo);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Artículo creado" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ArticuloDto dto)
        {
            var existing = await _unitOfWork.Articulos.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.Nombre = dto.Nombre;
            existing.Descripcion = dto.Descripcion;
            existing.Precio = dto.Precio;
            existing.StockDisponible = dto.StockDisponible;

            _unitOfWork.Articulos.Update(existing);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Artículo actualizado" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var articulo = await _unitOfWork.Articulos.GetByIdAsync(id);
            if (articulo == null) return NotFound();
            _unitOfWork.Articulos.Remove(articulo);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Artículo eliminado" });
        }
    }
}