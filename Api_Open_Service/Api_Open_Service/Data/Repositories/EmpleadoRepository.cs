using Api_Open_Service.Models;

namespace Api_Open_Service.Data.Repositories
{
    public class EmpleadoRepository : Repository<Empleado>, IEmpleadoRepository
    {
        public EmpleadoRepository(OpenServiceDbContext context) : base(context)
        {
        }
    }
}
