import { Routes } from '@angular/router';
import { InicioPageComponent } from './pages/inicio-page/inicio-page';
import { NosotrosPageComponent } from './pages/nosotros-page/nosotros-page';
import { ServiciosPageComponent } from './pages/servicios-page/servicios-page';
import { ProductosPageComponent } from './pages/productos-page/productos-page';
import { ProductoDetalleComponent } from './pages/producto-detalle/producto-detalle';
import { CarritoPageComponent } from './pages/carrito-page/carrito-page';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page';
import { ContactoPageComponent } from './pages/contacto-page/contacto-page';
import { HorarioPageComponent } from './pages/horario-page/horario-page';
import { NuevoTicketPageComponent } from './pages/nuevo-ticket-page/nuevo-ticket-page';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardPageComponent } from './admin-pages/dashboard-page/dashboard-page';
import { ClientesPageComponent } from './admin-pages/clientes-page/clientes-page';
import { AdminProductosPageComponent } from './admin-pages/admin-product-page/admin-product-page';
import { InventarioPageComponent } from './admin-pages/inventario-page/inventario-page';
import { CategoriasPageComponent } from './admin-pages/categorias-page/categorias-page';
import { ProveedorPageComponent } from './admin-pages/proveedor-page/proveedor-page';
import { ServiciosPageComponent as AdminServiciosPageComponent } from './admin-pages/servicios-page/servicios-page';
import { RepuestosPageComponent } from './admin-pages/repuestos-page/repuestos-page';
import { PedidosPageComponent } from './admin-pages/pedidos-page/pedidos-page';
import { VentasPageComponent } from './admin-pages/ventas-page/ventas-page';
import { ReportePageComponent } from './admin-pages/reporte-page/reporte-page';
import { ComprasPageComponent } from './admin-pages/compras-page/compras-page';
import { EmpleadosPageComponent } from './admin-pages/empleados-page/empleados-page';
import { ComprobantesPageComponent } from './admin-pages/comprobantes-page/comprobantes-page';
import { ConfiguracionesPageComponent } from './admin-pages/configuraciones-page/configuraciones-page';

export const routes: Routes = [
  { path: '', component: InicioPageComponent },
  { path: 'nosotros', component: NosotrosPageComponent },
  { path: 'servicios', component: ServiciosPageComponent },
  { path: 'productos', component: ProductosPageComponent },
  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'carrito', component: CarritoPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'contacto', component: ContactoPageComponent },
  { path: 'horario', component: HorarioPageComponent },
  { path: 'nuevo-ticket', component: NuevoTicketPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'recuperar-password', component: ForgotPasswordComponent, title: 'Recuperar Contraseña' },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'clientes', component: ClientesPageComponent },
      { path: 'productos', component: AdminProductosPageComponent },
      { path: 'inventario', component: InventarioPageComponent },
      { path: 'proveedor', component: ProveedorPageComponent },
      { path: 'servicios', component: AdminServiciosPageComponent },
      { path: 'repuestos', component: RepuestosPageComponent },
      { path: 'pedidos', component: PedidosPageComponent },
      { path: 'ventas', component: VentasPageComponent },
      { path: 'categorias', component: CategoriasPageComponent },
      { path: 'compras', component: ComprasPageComponent },
      { path: 'empleados', component: EmpleadosPageComponent },
      { path: 'reporte',  component: ReportePageComponent },
      { path: 'comprobantes', component: ComprobantesPageComponent },
      { path: 'configuraciones', component: ConfiguracionesPageComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];