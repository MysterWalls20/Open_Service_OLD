import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-page.html',
  styleUrl: './pedidos-page.scss',
})
export class PedidosPageComponent {
  showForm = false;
  editingId: number | null = null;

  pedidos: Pedido[] = [];

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
      this.pedidos = this.pedidos.filter(p => p.id !== id);
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
