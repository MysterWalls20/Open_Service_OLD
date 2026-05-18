import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-page.html',
  styleUrl: './pedidos-page.scss',
})
export class PedidosPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;

  pedidos: Pedido[] = [];
  loading = false;

  private routerSubscription?: Subscription;

  constructor(private pedidoService: PedidoService, private router: Router) {}

  ngOnInit() {
    this.cargarPedidos();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/pedidos') {
          this.cargarPedidos();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarPedidos() {
    this.loading = true;
    this.pedidoService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data.map((p: any) => ({
          id: p.idPedido,
          cliente: p.idClienteNavigation ? `${p.idClienteNavigation.nombres} ${p.idClienteNavigation.apellidos}` : 'N/A',
          producto: p.electrodomestico,
          cantidad: 1,
          total: 0,
          fecha: p.fechaSolicitud ? new Date(p.fechaSolicitud).toLocaleDateString() : 'N/A',
          estado: this.mapEstado(p.estado) as 'pendiente' | 'en-proceso' | 'completado' | 'cancelado'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.loading = false;
      }
    });
  }

  private mapEstado(estado: string): string {
    const map: Record<string, string> = {
      'Nuevo': 'pendiente',
      'En Proceso': 'en-proceso',
      'Completado': 'completado',
      'Cancelado': 'cancelado'
    };
    return map[estado] || 'pendiente';
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editPedido(pedido: Pedido) {
    this.editingId = pedido.id;
    this.showForm = true;
  }

  deletePedido(id: number) {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
      this.pedidoService.delete(id).subscribe({
        next: () => this.cargarPedidos(),
        error: (err) => console.error('Error al eliminar pedido', err)
      });
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'en-proceso': 'En Proceso',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return labels[estado] || estado;
  }
}
