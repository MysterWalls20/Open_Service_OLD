-- 1. Crear la base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'db_openservice')
BEGIN
    CREATE DATABASE DB_Open_Service;
END
GO

USE DB_Open_Service;
GO

-- ==========================================
-- 1. MÓDULO DE SEGURIDAD Y USUARIOS
-- ==========================================

CREATE TABLE Rol (
    IdRol INT IDENTITY(1,1) PRIMARY KEY,
    NombreRol NVARCHAR(50) NOT NULL
);

CREATE TABLE Usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Usuario NVARCHAR(50) NOT NULL UNIQUE,
    Correo NVARCHAR(100) NOT NULL UNIQUE,
    ContrasenaHash NVARCHAR(255) NOT NULL,
    Estado BIT NOT NULL DEFAULT 1 -- 1 es True
);

CREATE TABLE Empleado (
    IdEmpleado INT PRIMARY KEY,
    Nombres NVARCHAR(100) NOT NULL,
    Apellidos NVARCHAR(100) NOT NULL,
    IdRol INT NOT NULL,
    CONSTRAINT FK_Empleado_Usuario FOREIGN KEY (IdEmpleado) REFERENCES Usuario(IdUsuario),
    CONSTRAINT FK_Empleado_Rol FOREIGN KEY (IdRol) REFERENCES Rol(IdRol)
);

-- ==========================================
-- 2. MÓDULO DE CLIENTES Y CATÁLOGOS
-- ==========================================

CREATE TABLE Cliente (
    IdCliente INT IDENTITY(1,1) PRIMARY KEY,
    Nombres NVARCHAR(100) NOT NULL,
    Apellidos NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100) NOT NULL,
    Direccion NVARCHAR(150) NOT NULL,
    Telefono NVARCHAR(20) NOT NULL
);

CREATE TABLE Marca (
    IdMarca INT IDENTITY(1,1) PRIMARY KEY,
    NombreMarca NVARCHAR(50) NOT NULL
);

CREATE TABLE Categoria (
    IdCategoria INT IDENTITY(1,1) PRIMARY KEY,
    NombreCategoria NVARCHAR(50) NOT NULL
);

-- ==========================================
-- 3. MÓDULO OPERATIVO (SERVICIOS)
-- ==========================================

CREATE TABLE PedidoTicket (
    IdPedido INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion NVARCHAR(MAX) NOT NULL,
    Electrodomestico NVARCHAR(100) NOT NULL,
    Modelo NVARCHAR(100) NOT NULL,
    TipoDeServicio NVARCHAR(50) NOT NULL,
    UrlImagenAdjunta NVARCHAR(255) NULL,
    Estado NVARCHAR(30) NOT NULL DEFAULT 'Nuevo',
    FechaSolicitud DATETIME NOT NULL,
    IdCliente INT NOT NULL,
    IdMarca INT NOT NULL,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME NULL,
    CONSTRAINT FK_PedidoTicket_Cliente FOREIGN KEY (IdCliente) REFERENCES Cliente(IdCliente),
    CONSTRAINT FK_PedidoTicket_Marca FOREIGN KEY (IdMarca) REFERENCES Marca(IdMarca)
);

CREATE TABLE HistorialTicket (
    IdHistorial INT IDENTITY(1,1) PRIMARY KEY,
    IdPedido INT NOT NULL,
    EstadoAnterior NVARCHAR(30) NOT NULL,
    EstadoNuevo NVARCHAR(30) NOT NULL,
    FechaCambio DATETIME NOT NULL DEFAULT GETDATE(),
    Observacion NVARCHAR(MAX) NULL,
    CONSTRAINT FK_HistorialTicket_Pedido FOREIGN KEY (IdPedido) REFERENCES PedidoTicket(IdPedido)
);

CREATE TABLE ServicioOrden (
    IdServicio INT IDENTITY(1,1) PRIMARY KEY,
    IdPedido INT NOT NULL UNIQUE,
    IdEmpleado INT NOT NULL,
    DiagnosticoTecnico NVARCHAR(MAX) NULL,
    Estado NVARCHAR(30) NOT NULL,
    FechaServicio DATETIME NOT NULL,
    HoraInicio TIME NOT NULL,
    HoraFin TIME NULL,
    TotalServicio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT FK_ServicioOrden_Pedido FOREIGN KEY (IdPedido) REFERENCES PedidoTicket(IdPedido),
    CONSTRAINT FK_ServicioOrden_Empleado FOREIGN KEY (IdEmpleado) REFERENCES Empleado(IdEmpleado)
);

CREATE TABLE DetalleServicio (
    IdDetalleServicio INT IDENTITY(1,1) PRIMARY KEY,
    IdServicio INT NOT NULL,
    DescripcionTarea NVARCHAR(255) NOT NULL,
    CostoManoObra DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_DetalleServicio_Servicio FOREIGN KEY (IdServicio) REFERENCES ServicioOrden(IdServicio)
);

-- ==========================================
-- 4. MÓDULO DE INVENTARIO Y COMPRAS
-- ==========================================

CREATE TABLE Proveedor (
    IdProveedor INT IDENTITY(1,1) PRIMARY KEY,
    RazonSocial NVARCHAR(150) NOT NULL,
    RucContacto NVARCHAR(11) NOT NULL UNIQUE,
    Telefono NVARCHAR(20) NOT NULL
);

CREATE TABLE Articulo (
    IdArticulo INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    Precio DECIMAL(10,2) NOT NULL,
    StockDisponible INT NOT NULL DEFAULT 0
);

CREATE TABLE Producto (
    IdArticulo INT PRIMARY KEY,
    CategoriaMarketplace NVARCHAR(50) NOT NULL,
    UrlImagen NVARCHAR(255) NULL,
    IdCategoria INT NOT NULL,
    CONSTRAINT FK_Producto_Articulo FOREIGN KEY (IdArticulo) REFERENCES Articulo(IdArticulo),
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY (IdCategoria) REFERENCES Categoria(IdCategoria)
);

CREATE TABLE Repuesto (
    IdArticulo INT PRIMARY KEY,
    CompatibilidadMarca NVARCHAR(100) NOT NULL,
    CONSTRAINT FK_Repuesto_Articulo FOREIGN KEY (IdArticulo) REFERENCES Articulo(IdArticulo)
);

CREATE TABLE ConsumoRepuesto (
    IdConsumo INT IDENTITY(1,1) PRIMARY KEY,
    IdServicio INT NOT NULL,
    IdArticulo INT NOT NULL,
    Cantidad INT NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_ConsumoRepuesto_Servicio FOREIGN KEY (IdServicio) REFERENCES ServicioOrden(IdServicio),
    CONSTRAINT FK_ConsumoRepuesto_Repuesto FOREIGN KEY (IdArticulo) REFERENCES Repuesto(IdArticulo)
);

CREATE TABLE Compra (
    IdCompra INT IDENTITY(1,1) PRIMARY KEY,
    IdProveedor INT NOT NULL,
    NroFacturaProveedor NVARCHAR(50) NOT NULL,
    FechaCompra DATETIME NOT NULL,
    TotalCompra DECIMAL(10,2) NOT NULL,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME NULL,
    CONSTRAINT FK_Compra_Proveedor FOREIGN KEY (IdProveedor) REFERENCES Proveedor(IdProveedor)
);

CREATE TABLE DetalleCompra (
    IdDetalleCompra INT IDENTITY(1,1) PRIMARY KEY,
    IdCompra INT NOT NULL,
    IdArticulo INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitarioCompra DECIMAL(10,2) NOT NULL,
    SubtotalCompra DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_DetalleCompra_Compra FOREIGN KEY (IdCompra) REFERENCES Compra(IdCompra),
    CONSTRAINT FK_DetalleCompra_Articulo FOREIGN KEY (IdArticulo) REFERENCES Articulo(IdArticulo)
);

-- ==========================================
-- 5. MÓDULO DE VENTAS Y FACTURACIÓN
-- ==========================================

CREATE TABLE TipoPago (
    IdTipoPago INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion NVARCHAR(50) NOT NULL
);

CREATE TABLE Venta (
    IdVenta INT IDENTITY(1,1) PRIMARY KEY,
    IdCliente INT NOT NULL,
    IdTipoPago INT NOT NULL,
    IdServicio INT NULL,
    FechaVenta DATETIME NOT NULL,
    MontoTotal DECIMAL(10,2) NOT NULL,
    OrigenVenta NVARCHAR(50) NOT NULL,
    TipoComprobante NVARCHAR(20) NOT NULL,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME NULL,
    CONSTRAINT FK_Venta_Cliente FOREIGN KEY (IdCliente) REFERENCES Cliente(IdCliente),
    CONSTRAINT FK_Venta_TipoPago FOREIGN KEY (IdTipoPago) REFERENCES TipoPago(IdTipoPago),
    CONSTRAINT FK_Venta_Servicio FOREIGN KEY (IdServicio) REFERENCES ServicioOrden(IdServicio)
);

CREATE TABLE DetalleVenta (
    IdDetalleVenta INT IDENTITY(1,1) PRIMARY KEY,
    IdVenta INT NOT NULL,
    IdArticulo INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitarioVenta DECIMAL(10,2) NOT NULL,
    SubtotalVenta DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_DetalleVenta_Venta FOREIGN KEY (IdVenta) REFERENCES Venta(IdVenta),
    CONSTRAINT FK_DetalleVenta_Articulo FOREIGN KEY (IdArticulo) REFERENCES Articulo(IdArticulo)
);

CREATE TABLE Comprobante (
    IdComprobante INT IDENTITY(1,1) PRIMARY KEY,
    IdVenta INT NOT NULL UNIQUE,
    TipoDocumento NVARCHAR(20) NOT NULL,
    Serie NVARCHAR(10) NOT NULL,
    Correlativo NVARCHAR(20) NOT NULL,
    SubTotal DECIMAL(10,2) NOT NULL,
    MontoIGV DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_Comprobante_Venta FOREIGN KEY (IdVenta) REFERENCES Venta(IdVenta)
);
GO

-- ==========================================
-- TRIGGERS PARA AUDITORÍA (FechaModificacion)
-- ==========================================

CREATE TRIGGER TR_PedidoTicket_Update ON PedidoTicket AFTER UPDATE AS
BEGIN UPDATE PedidoTicket SET FechaModificacion = GETDATE() FROM PedidoTicket INNER JOIN inserted ON PedidoTicket.IdPedido = inserted.IdPedido END;
GO

CREATE TRIGGER TR_Compra_Update ON Compra AFTER UPDATE AS
BEGIN UPDATE Compra SET FechaModificacion = GETDATE() FROM Compra INNER JOIN inserted ON Compra.IdCompra = inserted.IdCompra END;
GO

CREATE TRIGGER TR_Venta_Update ON Venta AFTER UPDATE AS
BEGIN UPDATE Venta SET FechaModificacion = GETDATE() FROM Venta INNER JOIN inserted ON Venta.IdVenta = inserted.IdVenta END;
GO


-- Insertamos los 5 roles básicos
INSERT INTO Rol (NombreRol) 
VALUES 
('Administrador'),
('Vendedor'),
('Comprador'),
('Técnico'),
('Inventario');

-- Verificamos que se hayan guardado correctamente
SELECT * FROM Usuario;