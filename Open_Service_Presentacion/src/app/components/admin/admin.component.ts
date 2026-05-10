import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header';

interface MenuItem {
  title: string;
  icon: string;
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
export class AdminComponent implements OnInit {
  adminUser: { email: string } | null = null;
  menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: '', route: '/admin/dashboard', active: true },
    { title: 'Clientes', icon: '', route: '/admin/clientes' },
    { title: 'Productos', icon: '', route: '/admin/productos' },
    { title: 'Inventario', icon: '', route: '/admin/inventario' },
    { title: 'Proveedor', icon: '', route: '/admin/proveedor' },
    { title: 'Servicios', icon: '', route: '/admin/servicios' },
    { title: 'Pedidos', icon: '', route: '/admin/pedidos' },
    { title: 'Ventas', icon: '', route: '/admin/ventas' },
    { title: 'Reporte', icon: '', route: '/admin/reporte' },
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      this.adminUser = JSON.parse(storedUser);
    }
  }

  setActive(item: MenuItem) {
    this.menuItems.forEach(i => i.active = false);
    item.active = true;
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin_user');
    this.router.navigate(['/login']);
  }
}