using Api_Open_Service.Data.Repositories;
using Api_Open_Service.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api_Open_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarcasController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public MarcasController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var marcas = await _unitOfWork.Marcas.GetAllAsync();
            return Ok(marcas);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Marca marca)
        {
            await _unitOfWork.Marcas.AddAsync(marca);
            await _unitOfWork.SaveAsync();
            return CreatedAtAction(nameof(GetAll), new { id = marca.IdMarca }, marca);
        }
    }
}
