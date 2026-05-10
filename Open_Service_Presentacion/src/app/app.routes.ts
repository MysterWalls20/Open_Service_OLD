import { Routes } from '@angular/router';
import { InicioPageComponent } from './pages/inicio-page/inicio-page';
import { NosotrosPageComponent } from './pages/nosotros-page/nosotros-page';
import { ServiciosPageComponent } from './pages/servicios-page/servicios-page';
import { ProductosPageComponent } from './pages/productos-page/productos-page';
import { ContactoPageComponent } from './pages/contacto-page/contacto-page';
import { HorarioPageComponent } from './pages/horario-page/horario-page';
import { NuevoTicketPageComponent } from './pages/nuevo-ticket-page/nuevo-ticket-page';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardPageComponent } from './admin-pages/dashboard-page/dashboard-page';
import { ClientesPageComponent } from './admin-pages/clientes-page/clientes-page';
import { ProductosPageComponent as AdminProductosPageComponent } from './admin-pages/productos-page/productos-page';
import { InventarioPageComponent } from './admin-pages/inventario-page/inventario-page';
import { ProveedorPageComponent } from './admin-pages/proveedor-page/proveedor-page';
import { ServiciosPageComponent as AdminServiciosPageComponent } from './admin-pages/servicios-page/servicios-page';
import { PedidosPageComponent } from './admin-pages/pedidos-page/pedidos-page';
import { VentasPageComponent } from './admin-pages/ventas-page/ventas-page';
import { ReportePageComponent } from './admin-pages/reporte-page/reporte-page';

export const routes: Routes = [
  { path: '', component: InicioPageComponent },
  { path: 'nosotros', component: NosotrosPageComponent },
  { path: 'servicios', component: ServiciosPageComponent },
  { path: 'productos', component: ProductosPageComponent },
  { path: 'contacto', component: ContactoPageComponent },
  { path: 'horario', component: HorarioPageComponent },
  { path: 'nuevo-ticket', component: NuevoTicketPageComponent },
  { path: 'login', component: LoginComponent },
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
      { path: 'pedidos', component: PedidosPageComponent },
      { path: 'ventas', component: VentasPageComponent },
      { path: 'reporte', component: ReportePageComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
