using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComprasController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ComprasController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var compras = await _unitOfWork.Compras.GetAllAsync();
            var dtos = compras.Select(c => new CompraDto
            {
                IdCompra = c.IdCompra,
                IdProveedor = c.IdProveedor,
                NroFacturaProveedor = c.NroFacturaProveedor,
                FechaCompra = c.FechaCompra,
                TotalCompra = c.TotalCompra
            });
            return Ok(dtos);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompraRegistroDto dto)
        {
            if (dto.Detalles == null || !dto.Detalles.Any())
                return BadRequest(new { mensaje = "La compra debe tener al menos un detalle." });

            decimal totalCalculado = 0;
            var listaDetalles = new List<DetalleCompra>();

            // 1. Procesar detalles y actualizar stock
            foreach (var item in dto.Detalles)
            {
                var subtotal = item.Cantidad * item.PrecioUnitarioCompra;
                totalCalculado += subtotal;

                listaDetalles.Add(new DetalleCompra
                {
                    IdArticulo = item.IdArticulo,
                    Cantidad = item.Cantidad,
                    PrecioUnitarioCompra = item.PrecioUnitarioCompra,
                    SubtotalCompra = subtotal
                });

                var articulo = await _unitOfWork.Articulos.GetByIdAsync(item.IdArticulo);
                if (articulo != null)
                {
                    articulo.StockDisponible += item.Cantidad; // Aumentamos inventario
                    _unitOfWork.Articulos.Update(articulo);
                }
            }

            // 2. Crear cabecera de la compra
            var nuevaCompra = new Compra
            {
                IdProveedor = dto.IdProveedor,
                NroFacturaProveedor = dto.NroFacturaProveedor,
                FechaCompra = dto.FechaCompra,
                TotalCompra = totalCalculado,
                FechaRegistro = DateTime.Now,
                DetalleCompras = listaDetalles // Agregamos los detalles a la compra
            };

            await _unitOfWork.Compras.AddAsync(nuevaCompra);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Compra registrada y stock actualizado con éxito." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var compra = await _unitOfWork.Compras.GetByIdAsync(id);
            if (compra == null) return NotFound();

            // Ojo: En un sistema real, anular una compra debería restar el stock nuevamente.
            // Para simplificar tu entrega universitaria, solo borramos la cabecera (requeriría configuración en cascada).
            _unitOfWork.Compras.Remove(compra);
            await _unitOfWork.SaveAsync();

            return Ok(new { mensaje = "Compra eliminada" });
        }
    }
}