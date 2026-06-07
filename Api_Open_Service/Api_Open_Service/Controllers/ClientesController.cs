using Api_Open_Service.Data.Repositories;
using Api_Open_Service.DTOs;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientesController : ControllerBase
    {
        private readonly IRepository<Cliente> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public ClientesController(IRepository<Cliente> repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var clientes = await _repository.GetAllAsync();
            return Ok(clientes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cliente = await _repository.GetByIdAsync(id);
            if (cliente == null) return NotFound(new { mensaje = "Cliente no encontrado." });
            return Ok(cliente);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClienteDto dto)
        {
            var nuevoCliente = new Cliente
            {
                Nombres = dto.Nombres,
                Apellidos = dto.Apellidos,
                Correo = dto.Correo,
                Telefono = dto.Telefono,
                Direccion = dto.Direccion
            };

            await _repository.AddAsync(nuevoCliente);
            await _unitOfWork.SaveAsync();
            return CreatedAtAction(nameof(GetById), new { id = nuevoCliente.IdCliente }, nuevoCliente);
        }
    }
}
