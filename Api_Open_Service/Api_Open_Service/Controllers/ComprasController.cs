using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComprasController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly OpenServiceDbContext _context; // Inyectamos el Contexto directo

        public ComprasController(IUnitOfWork unitOfWork, OpenServiceDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
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

        // ==========================================
        // CREAR COMPRA Y SUMAR STOCK
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompraRegistroDto dto)
        {
            try
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

                    // AUMENTAMOS STOCK: Buscamos el artículo y forzamos su actualización
                    var articulo = await _context.Set<Articulo>().FindAsync(item.IdArticulo);
                    if (articulo != null)
                    {
                        articulo.StockDisponible += item.Cantidad;
                        _context.Set<Articulo>().Update(articulo); // <-- ESTA LÍNEA OBLIGA A EF CORE A NO IGNORARLO
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
                    DetalleCompras = listaDetalles
                };

                await _context.Set<Compra>().AddAsync(nuevaCompra);
                await _unitOfWork.SaveAsync(); // Guarda cabecera, detalles y stock en un solo movimiento seguro

                return Ok(new { mensaje = "Compra registrada y stock actualizado con éxito." });
            }
            catch (Exception ex)
            {
                string errorReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { mensaje = "Error al registrar la compra", detalle = errorReal });
            }
        }

        // ==========================================
        // ELIMINAR COMPRA Y RESTAR STOCK (DEVOLUCIÓN)
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Buscamos la compra INCLUYENDO sus detalles (imprescindible para revertir el stock)
                var compra = await _context.Set<Compra>()
                    .Include(c => c.DetalleCompras)
                    .FirstOrDefaultAsync(c => c.IdCompra == id);

                if (compra == null) return NotFound(new { mensaje = "Compra no encontrada." });

                // 1. REVERTIMOS EL STOCK Y BORRAMOS LOS DETALLES
                if (compra.DetalleCompras != null && compra.DetalleCompras.Any())
                {
                    foreach (var detalle in compra.DetalleCompras)
                    {
                        var articulo = await _context.Set<Articulo>().FindAsync(detalle.IdArticulo);
                        if (articulo != null)
                        {
                            // Como anulamos la compra, RESTAMOS el stock que habíamos sumado
                            articulo.StockDisponible -= detalle.Cantidad;
                            _context.Set<Articulo>().Update(articulo); // Forzamos actualización
                        }
                    }

                    // Borramos explícitamente los detalles para evitar el error de Foreign Key de SQL Server
                    _context.Set<DetalleCompra>().RemoveRange(compra.DetalleCompras);
                }

                // 2. Eliminamos la cabecera de la compra
                _context.Set<Compra>().Remove(compra);

                await _unitOfWork.SaveAsync();

                return Ok(new { mensaje = "Compra anulada. El stock de los artículos ha sido revertido exitosamente." });
            }
            catch (Exception ex)
            {
                string errorReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { mensaje = "Error al eliminar la compra", detalle = errorReal });
            }
        }
    }
}