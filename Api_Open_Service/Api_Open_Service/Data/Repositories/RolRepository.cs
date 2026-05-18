using Api_Open_Service.Models;

namespace Api_Open_Service.Data.Repositories
{
    public class RolRepository : Repository<Rol>, IRolRepository
    {
        public RolRepository(OpenServiceDbContext context) : base(context)
        {
        }
    }
}
