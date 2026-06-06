import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header';
import { filter, Subscription } from 'rxjs';

interface MenuItem {
  title: string;
  route: string;
  active?: boolean;
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
  menuItems: MenuItem[] = [
    { title: 'Dashboard', route: '/admin/dashboard' },
    { title: 'Clientes', route: '/admin/clientes' },
    { title: 'Productos', route: '/admin/productos' },
    { title: 'Inventario', route: '/admin/inventario' },
    { title: 'Proveedor', route: '/admin/proveedor' },
    { title: 'Servicios', route: '/admin/servicios' },
    { title: 'Repuestos', route: '/admin/repuestos' },
    { title: 'Pedidos', route: '/admin/pedidos' },
    { title: 'Ventas', route: '/admin/ventas' },
    { title: 'Comprobantes', route: '/admin/comprobantes' },
    { title: 'Compras',    route: '/admin/compras' },
    { title: 'Empleados',  route: '/admin/empleados' },
    { title: 'Reporte',    route: '/admin/reporte' },
  ];

  private routerSubscription?: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      this.adminUser = JSON.parse(storedUser);
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
    this.menuItems.forEach(item => {
      item.active = currentUrl === item.route;
    });
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin_user');
    this.router.navigate(['/login']);
  }
}