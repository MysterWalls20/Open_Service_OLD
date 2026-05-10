import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPageComponent {
  stats = [
    { label: 'Clientes', value: 156, icon: '👥', color: 'users' },
    { label: 'Productos', value: 42, icon: '📦', color: 'products' },
    { label: 'Servicios', value: 28, icon: '🔧', color: 'services' },
    { label: 'Pedidos', value: 89, icon: '📋', color: 'orders' },
  ];

  recentOrders = [
    { id: '#ORD-001', status: 'Pendiente', date: '20/04/2026', statusClass: 'pending' },
    { id: '#ORD-002', status: 'Completado', date: '19/04/2026', statusClass: 'completed' },
    { id: '#ORD-003', status: 'En Proceso', date: '18/04/2026', statusClass: 'in-progress' },
  ];
}
