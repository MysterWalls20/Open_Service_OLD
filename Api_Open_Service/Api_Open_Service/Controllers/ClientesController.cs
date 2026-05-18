using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> Create([FromBody] Cliente cliente)
        {
            await _repository.AddAsync(cliente);
            await _unitOfWork.SaveAsync();
            return CreatedAtAction(nameof(GetById), new { id = cliente.IdCliente }, cliente);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Cliente cliente)
        {
            if (id != cliente.IdCliente) return BadRequest(new { mensaje = "El ID no coincide." });
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { mensaje = "Cliente no encontrado." });
            _repository.Update(cliente);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Cliente actualizado correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var cliente = await _repository.GetByIdAsync(id);
            if (cliente == null) return NotFound(new { mensaje = "Cliente no encontrado." });
            _repository.Remove(cliente);
            await _unitOfWork.SaveAsync();
            return Ok(new { mensaje = "Cliente eliminado correctamente." });
        }
    }
}
