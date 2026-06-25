import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header';
import { filter, Subscription } from 'rxjs';

interface MenuItem {
  title: string;
  route: string;
  active?: boolean;
  roles: string[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, AdminHeaderComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit, OnDestroy {
  adminUser: { email: string; nombre: string; rol: string } | null = null;
  
  // Matriz de permisos EXACTA a lo que solicitaste
  menuItems: MenuItem[] = [
    { title: 'Dashboard', route: '/admin/dashboard', roles: ['Administrador', 'Vendedor', 'Comprador_Inventario', 'Técnico', 'Inventario'] },
    { title: 'Clientes', route: '/admin/clientes', roles: ['Administrador', 'Técnico'] },
    { title: 'Productos', route: '/admin/productos', roles: ['Administrador', 'Comprador_Inventario', 'Inventario'] },
    { title: 'Inventario', route: '/admin/inventario', roles: ['Administrador', 'Comprador_Inventario', 'Inventario'] },
    { title: 'Categorias', route: '/admin/categorias', roles: ['Administrador', 'Comprador_Inventario'] },
    { title: 'Proveedor', route: '/admin/proveedor', roles: ['Administrador', 'Comprador_Inventario'] },
    { title: 'Servicios', route: '/admin/servicios', roles: ['Administrador', 'Técnico'] },
    { title: 'Repuestos', route: '/admin/repuestos', roles: ['Administrador', 'Comprador_Inventario', 'Inventario'] },
    { title: 'Pedidos', route: '/admin/pedidos', roles: ['Administrador', 'Técnico'] },
    { title: 'Ventas', route: '/admin/ventas', roles: ['Administrador', 'Vendedor', 'Técnico'] },
    { title: 'Comprobantes', route: '/admin/comprobantes', roles: ['Administrador', 'Vendedor', 'Técnico'] },
    { title: 'Compras',    route: '/admin/compras', roles: ['Administrador', 'Comprador_Inventario'] },
    { title: 'Empleados',  route: '/admin/empleados', roles: ['Administrador'] },
    { title: 'Reporte',    route: '/admin/reporte', roles: ['Administrador', 'Vendedor', 'Técnico'] },
  ];

  filteredMenuItems: MenuItem[] = []; // Menú final que verá el usuario
  private routerSubscription?: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      this.adminUser = JSON.parse(storedUser);
      
      // Filtramos el menú: Solo se quedan los ítems donde el rol del usuario esté en el arreglo
      if (this.adminUser) {
        this.filteredMenuItems = this.menuItems.filter(item => item.roles.includes(this.adminUser!.rol));
      }
    }

    this.syncActiveWithRouter();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncActiveWithRouter();
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private syncActiveWithRouter() {
    const currentUrl = this.router.url;
    this.filteredMenuItems.forEach(item => {
      item.active = currentUrl === item.route;
    });
  }

  irConfiguraciones() {
    this.router.navigate(['/admin/configuraciones']);
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('token'); 
    this.router.navigate(['/login']);
  }
}