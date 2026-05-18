using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProveedoresController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProveedoresController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Ojo: Asumo que en tu IUnitOfWork agregaste IRepository<Proveedor> Proveedores { get; }
            var proveedores = await _unitOfWork.Proveedores.GetAllAsync();
            var dtos = proveedores.Select(p => new ProveedorDto
            {
                IdProveedor = p.IdProveedor,
                RazonSocial = p.RazonSocial,
                RucContacto = p.RucContacto,
                Telefono = p.Telefono,
                Email = p.Email
            });
            return Ok(dtos);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProveedorDto dto)
        {
            var nuevoProveedor = new Proveedor
            {
                RazonSocial = dto.RazonSocial,
                RucContacto = dto.RucContacto,
                Telefono = dto.Telefono,
                Email = dto.Email
            };
            await _unitOfWork.Proveedores.AddAsync(nuevoProveedor);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Proveedor creado con éxito" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProveedorDto dto)
        {
            var existing = await _unitOfWork.Proveedores.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.RazonSocial = dto.RazonSocial;
            existing.RucContacto = dto.RucContacto;
            existing.Telefono = dto.Telefono;
            existing.Email = dto.Email;

            _unitOfWork.Proveedores.Update(existing);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Proveedor actualizado" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var proveedor = await _unitOfWork.Proveedores.GetByIdAsync(id);
            if (proveedor == null) return NotFound();
            _unitOfWork.Proveedores.Remove(proveedor);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Proveedor eliminado" });
        }
    }
}