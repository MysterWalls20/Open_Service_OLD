namespace Api_Open_Service.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly OpenServiceDbContext _context;

        public IUsuarioRepository Usuarios { get; private set; }
        public IEmpleadoRepository Empleados { get; private set; }
        public IRolRepository Roles { get; private set; }

        public UnitOfWork(OpenServiceDbContext context)
        {
            _context = context;
            Usuarios = new UsuarioRepository(_context);
            Empleados = new EmpleadoRepository(_context);
            Roles = new RolRepository(_context);
        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
