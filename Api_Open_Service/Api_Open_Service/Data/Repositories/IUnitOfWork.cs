using Api_Open_Service.Models;

namespace Api_Open_Service.Data.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        // --- Módulo de Seguridad y Personal ---
        IRepository<Usuario> Usuarios { get; }
        IRepository<Empleado> Empleados { get; }
        IRepository<Rol> Roles { get; }

        // --- Módulo de Compras e Inventario ---
        IRepository<Proveedor> Proveedores { get; }
        IRepository<Articulo> Articulos { get; }
        IRepository<Compra> Compras { get; }
        IRepository<Categorium> Categorias { get; }
        IRepository<Marca> Marcas { get; }

        // --- Módulo de Ventas ---
        IRepository<Ventum> Ventas { get; } // Nota: EF Core lo nombra Ventum en singular
        IRepository<Cliente> Clientes { get; }
        IRepository<TipoPago> TiposPago { get; }

        // --- Módulo de Servicios ---
        IRepository<PedidoTicket> Pedidos { get; }
        IRepository<ServicioOrden> Servicios { get; }

        // Aquí agregaremos repositorios específicos luego (ej. Clientes, Ventas)
        Task<int> SaveAsync();
    }
}
