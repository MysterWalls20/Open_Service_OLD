using Api_Open_Service.Models;

namespace Api_Open_Service.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly OpenServiceDbContext _context;

        // Propiedades Módulo Seguridad
        public IRepository<Usuario> Usuarios { get; private set; }
        public IRepository<Empleado> Empleados { get; private set; }
        public IRepository<Rol> Roles { get; private set; }

        // Propiedades Módulo Compras e Inventario
        public IRepository<Proveedor> Proveedores { get; private set; }
        public IRepository<Articulo> Articulos { get; private set; }
        public IRepository<Compra> Compras { get; private set; }
        public IRepository<Categorium> Categorias { get; private set; }
        public IRepository<Marca> Marcas { get; private set; }

        // Propiedades Módulo Ventas
        public IRepository<Ventum> Ventas { get; private set; }
        public IRepository<Cliente> Clientes { get; private set; }
        public IRepository<TipoPago> TiposPago { get; private set; }

        // Propiedades Módulo Servicios
        public IRepository<PedidoTicket> Pedidos { get; private set; }
        public IRepository<ServicioOrden> Servicios { get; private set; }

        public UnitOfWork(OpenServiceDbContext context)
        {
            _context = context;

            // Instanciamos TODO de forma genérica
            Usuarios = new Repository<Usuario>(_context);
            Empleados = new Repository<Empleado>(_context);
            Roles = new Repository<Rol>(_context);

            Proveedores = new Repository<Proveedor>(_context);
            Articulos = new Repository<Articulo>(_context);
            Compras = new Repository<Compra>(_context);
            Categorias = new Repository<Categorium>(_context);
            Marcas = new Repository<Marca>(_context);

            Ventas = new Repository<Ventum>(_context);
            Clientes = new Repository<Cliente>(_context);
            TiposPago = new Repository<TipoPago>(_context);

            Pedidos = new Repository<PedidoTicket>(_context);
            Servicios = new Repository<ServicioOrden>(_context);
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
