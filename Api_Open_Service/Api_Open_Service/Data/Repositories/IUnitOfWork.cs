using Api_Open_Service.Models;

namespace Api_Open_Service.Data.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        // Tienes que declarar explícitamente los repositorios aquí:
        IUsuarioRepository Usuarios { get; }
        IEmpleadoRepository Empleados { get; }
        IRolRepository Roles { get; }



        IRepository<Proveedor> Proveedores { get; }
        IRepository<Articulo> Articulos { get; }

        IRepository<Compra> Compras { get; }

        // Aquí agregaremos repositorios específicos luego (ej. Clientes, Ventas)
        Task<int> SaveAsync();
    }
}
