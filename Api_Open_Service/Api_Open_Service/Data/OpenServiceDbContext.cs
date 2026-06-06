using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Api_Open_Service.Models;

public partial class OpenServiceDbContext : DbContext
{
    public OpenServiceDbContext()
    {
    }

    public OpenServiceDbContext(DbContextOptions<OpenServiceDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Articulo> Articulos { get; set; }

    public virtual DbSet<Categorium> Categoria { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Compra> Compras { get; set; }

    public virtual DbSet<Comprobante> Comprobantes { get; set; }

    public virtual DbSet<ConsumoRepuesto> ConsumoRepuestos { get; set; }

    public virtual DbSet<DetalleCompra> DetalleCompras { get; set; }

    public virtual DbSet<DetalleServicio> DetalleServicios { get; set; }

    public virtual DbSet<DetalleVentum> DetalleVenta { get; set; }

    public virtual DbSet<Empleado> Empleados { get; set; }

    public virtual DbSet<HistorialTicket> HistorialTickets { get; set; }

    public virtual DbSet<Marca> Marcas { get; set; }

    public virtual DbSet<PedidoTicket> PedidoTickets { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Proveedor> Proveedors { get; set; }

    public virtual DbSet<Repuesto> Repuestos { get; set; }

    public virtual DbSet<Rol> Rols { get; set; }

    public virtual DbSet<ServicioOrden> ServicioOrdens { get; set; }

    public virtual DbSet<TipoPago> TipoPagos { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<Ventum> Venta { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Articulo>(entity =>
        {
            entity.HasKey(e => e.IdArticulo).HasName("PK__Articulo__F8FF5D524F2E81C3");

            entity.ToTable("Articulo");

            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Precio).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<Categorium>(entity =>
        {
            entity.HasKey(e => e.IdCategoria).HasName("PK__Categori__A3C02A108E62D58E");

            entity.Property(e => e.NombreCategoria).HasMaxLength(50);
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.IdCliente).HasName("PK__Cliente__D594664292FB5944");

            entity.ToTable("Cliente");

            entity.Property(e => e.Apellidos).HasMaxLength(100);
            entity.Property(e => e.Correo).HasMaxLength(100);
            entity.Property(e => e.Direccion).HasMaxLength(150);
            entity.Property(e => e.Nombres).HasMaxLength(100);
            entity.Property(e => e.Telefono).HasMaxLength(20);
        });

        modelBuilder.Entity<Compra>(entity =>
        {
            entity.HasKey(e => e.IdCompra).HasName("PK__Compra__0A5CDB5C98A5AF3A");

            entity.ToTable("Compra", tb => tb.HasTrigger("TR_Compra_Update"));

            entity.Property(e => e.FechaCompra).HasColumnType("datetime");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.NroFacturaProveedor).HasMaxLength(50);
            entity.Property(e => e.TotalCompra).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdProveedorNavigation).WithMany(p => p.Compras)
                .HasForeignKey(d => d.IdProveedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Compra_Proveedor");
        });

        modelBuilder.Entity<Comprobante>(entity =>
        {
            entity.HasKey(e => e.IdComprobante).HasName("PK__Comproba__BF4686ED79916336");

            entity.ToTable("Comprobante");

            entity.HasIndex(e => e.IdVenta, "UQ__Comproba__BC1240BC4EAE39BB").IsUnique();

            entity.Property(e => e.Correlativo).HasMaxLength(20);
            entity.Property(e => e.MontoIgv)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("MontoIGV");
            entity.Property(e => e.Serie).HasMaxLength(10);
            entity.Property(e => e.SubTotal).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.TipoDocumento).HasMaxLength(20);

            entity.HasOne(d => d.IdVentaNavigation).WithOne(p => p.Comprobante)
                .HasForeignKey<Comprobante>(d => d.IdVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Comprobante_Venta");
        });

        modelBuilder.Entity<ConsumoRepuesto>(entity =>
        {
            entity.HasKey(e => e.IdConsumo).HasName("PK__ConsumoR__2C4471EDE967E6CC");

            entity.ToTable("ConsumoRepuesto");

            entity.Property(e => e.Subtotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdArticuloNavigation).WithMany(p => p.ConsumoRepuestos)
                .HasForeignKey(d => d.IdArticulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ConsumoRepuesto_Repuesto");

            entity.HasOne(d => d.IdServicioNavigation).WithMany(p => p.ConsumoRepuestos)
                .HasForeignKey(d => d.IdServicio)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ConsumoRepuesto_Servicio");
        });

        modelBuilder.Entity<DetalleCompra>(entity =>
        {
            entity.HasKey(e => e.IdDetalleCompra).HasName("PK__DetalleC__E046CCBBD5656330");

            entity.ToTable("DetalleCompra");

            entity.Property(e => e.PrecioUnitarioCompra).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.SubtotalCompra).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdArticuloNavigation).WithMany(p => p.DetalleCompras)
                .HasForeignKey(d => d.IdArticulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleCompra_Articulo");

            entity.HasOne(d => d.IdCompraNavigation).WithMany(p => p.DetalleCompras)
                .HasForeignKey(d => d.IdCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleCompra_Compra");
        });

        modelBuilder.Entity<DetalleServicio>(entity =>
        {
            entity.HasKey(e => e.IdDetalleServicio).HasName("PK__DetalleS__0BFF94E654CA594B");

            entity.ToTable("DetalleServicio");

            entity.Property(e => e.CostoManoObra).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.DescripcionTarea).HasMaxLength(255);

            entity.HasOne(d => d.IdServicioNavigation).WithMany(p => p.DetalleServicios)
                .HasForeignKey(d => d.IdServicio)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleServicio_Servicio");
        });

        modelBuilder.Entity<DetalleVentum>(entity =>
        {
            entity.HasKey(e => e.IdDetalleVenta).HasName("PK__DetalleV__AAA5CEC2771E6C11");

            entity.Property(e => e.PrecioUnitarioVenta).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.SubtotalVenta).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdArticuloNavigation).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.IdArticulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleVenta_Articulo");

            entity.HasOne(d => d.IdVentaNavigation).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.IdVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleVenta_Venta");
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.HasKey(e => e.IdEmpleado).HasName("PK__Empleado__CE6D8B9E86AB0D18");

            entity.ToTable("Empleado");

            entity.Property(e => e.IdEmpleado).ValueGeneratedNever();
            entity.Property(e => e.Apellidos).HasMaxLength(100);
            entity.Property(e => e.Nombres).HasMaxLength(100);

            entity.HasOne(d => d.IdEmpleadoNavigation).WithOne(p => p.Empleado)
                .HasForeignKey<Empleado>(d => d.IdEmpleado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Empleado_Usuario");

            entity.HasOne(d => d.IdRolNavigation).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.IdRol)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Empleado_Rol");
        });

        modelBuilder.Entity<HistorialTicket>(entity =>
        {
            entity.HasKey(e => e.IdHistorial).HasName("PK__Historia__9CC7DBB4A6C254D8");

            entity.ToTable("HistorialTicket");

            entity.Property(e => e.EstadoAnterior).HasMaxLength(30);
            entity.Property(e => e.EstadoNuevo).HasMaxLength(30);
            entity.Property(e => e.FechaCambio)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.IdPedidoNavigation).WithMany(p => p.HistorialTickets)
                .HasForeignKey(d => d.IdPedido)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_HistorialTicket_Pedido");
        });

        modelBuilder.Entity<Marca>(entity =>
        {
            entity.HasKey(e => e.IdMarca).HasName("PK__Marca__4076A8870EDF0B57");

            entity.ToTable("Marca");

            entity.Property(e => e.NombreMarca).HasMaxLength(50);
        });

        modelBuilder.Entity<PedidoTicket>(entity =>
        {
            entity.HasKey(e => e.IdPedido).HasName("PK__PedidoTi__9D335DC32D56837A");

            entity.ToTable("PedidoTicket", tb => tb.HasTrigger("TR_PedidoTicket_Update"));

            entity.Property(e => e.Electrodomestico).HasMaxLength(100);
            entity.Property(e => e.Estado)
                .HasMaxLength(30)
                .HasDefaultValue("Nuevo");
            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaSolicitud).HasColumnType("datetime");
            entity.Property(e => e.Modelo).HasMaxLength(100);
            entity.Property(e => e.TipoDeServicio).HasMaxLength(50);
            entity.Property(e => e.UrlImagenAdjunta).HasMaxLength(255);

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.PedidoTickets)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PedidoTicket_Cliente");

            entity.HasOne(d => d.IdMarcaNavigation).WithMany(p => p.PedidoTickets)
                .HasForeignKey(d => d.IdMarca)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PedidoTicket_Marca");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.IdArticulo).HasName("PK__Producto__F8FF5D52ED6937A3");

            entity.ToTable("Producto");

            entity.Property(e => e.IdArticulo).ValueGeneratedNever();
            entity.Property(e => e.CategoriaMarketplace).HasMaxLength(50);
            entity.Property(e => e.UrlImagen).HasMaxLength(255);

            entity.HasOne(d => d.IdArticuloNavigation).WithOne(p => p.Producto)
                .HasForeignKey<Producto>(d => d.IdArticulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Producto_Articulo");

            entity.HasOne(d => d.IdCategoriaNavigation).WithMany(p => p.Productos)
                .HasForeignKey(d => d.IdCategoria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Producto_Categoria");
        });

        modelBuilder.Entity<Proveedor>(entity =>
        {
            entity.HasKey(e => e.IdProveedor).HasName("PK__Proveedo__E8B631AF5A047D24");

            entity.ToTable("Proveedor");

            entity.HasIndex(e => e.RucContacto, "UQ__Proveedo__FA89126A22926D61").IsUnique();

            entity.Property(e => e.RazonSocial).HasMaxLength(150);
            entity.Property(e => e.RucContacto).HasMaxLength(11);
            entity.Property(e => e.Telefono).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
        });

        modelBuilder.Entity<Repuesto>(entity =>
        {
            entity.HasKey(e => e.IdArticulo).HasName("PK__Repuesto__F8FF5D520D3787BC");

            entity.ToTable("Repuesto");

            entity.Property(e => e.IdArticulo).ValueGeneratedNever();
            entity.Property(e => e.CompatibilidadMarca).HasMaxLength(100);

            entity.HasOne(d => d.IdArticuloNavigation).WithOne(p => p.Repuesto)
                .HasForeignKey<Repuesto>(d => d.IdArticulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Repuesto_Articulo");
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(e => e.IdRol).HasName("PK__Rol__2A49584CB03DA565");

            entity.ToTable("Rol");

            entity.Property(e => e.NombreRol).HasMaxLength(50);
        });

        modelBuilder.Entity<ServicioOrden>(entity =>
        {
            entity.HasKey(e => e.IdServicio).HasName("PK__Servicio__2DCCF9A2DAF536C5");

            entity.ToTable("ServicioOrden");

            entity.HasIndex(e => e.IdPedido, "UQ__Servicio__9D335DC2F9598066").IsUnique();

            entity.Property(e => e.Estado).HasMaxLength(30);
            entity.Property(e => e.FechaServicio).HasColumnType("datetime");
            entity.Property(e => e.TotalServicio).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdEmpleadoNavigation).WithMany(p => p.ServicioOrdens)
                .HasForeignKey(d => d.IdEmpleado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ServicioOrden_Empleado");

            entity.HasOne(d => d.IdPedidoNavigation).WithOne(p => p.ServicioOrden)
                .HasForeignKey<ServicioOrden>(d => d.IdPedido)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ServicioOrden_Pedido");
        });

        modelBuilder.Entity<TipoPago>(entity =>
        {
            entity.HasKey(e => e.IdTipoPago).HasName("PK__TipoPago__EB0AA9E7C9E1E03B");

            entity.ToTable("TipoPago");

            entity.Property(e => e.Descripcion).HasMaxLength(50);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__Usuario__5B65BF9752369510");

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.Correo, "UQ__Usuario__60695A19C24DF3F1").IsUnique();

            entity.HasIndex(e => e.Usuario1, "UQ__Usuario__E3237CF76AF58CD2").IsUnique();

            entity.Property(e => e.ContrasenaHash).HasMaxLength(255);
            entity.Property(e => e.Correo).HasMaxLength(100);
            entity.Property(e => e.Estado).HasDefaultValue(true);
            entity.Property(e => e.Usuario1)
                .HasMaxLength(50)
                .HasColumnName("Usuario");
        });

        modelBuilder.Entity<Ventum>(entity =>
        {
            entity.HasKey(e => e.IdVenta).HasName("PK__Venta__BC1240BD1CDFD169");

            entity.ToTable(tb => tb.HasTrigger("TR_Venta_Update"));

            entity.Property(e => e.FechaModificacion).HasColumnType("datetime");
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaVenta).HasColumnType("datetime");
            entity.Property(e => e.MontoTotal).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.OrigenVenta).HasMaxLength(50);
            entity.Property(e => e.TipoComprobante).HasMaxLength(20);

            // Dentro de OnModelCreating en OpenServiceDbContext.cs
            entity.Property(e => e.MontoIGV).HasColumnType("decimal(18, 2)").HasColumnName("MontoIGV"); // Pon el nombre exacto de tu columna en SQL

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Venta_Cliente");

            entity.HasOne(d => d.IdServicioNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdServicio)
                .HasConstraintName("FK_Venta_Servicio");

            entity.HasOne(d => d.IdTipoPagoNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdTipoPago)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Venta_TipoPago");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
