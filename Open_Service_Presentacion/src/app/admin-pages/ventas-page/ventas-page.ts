import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Venta } from '../../models/venta.model';

@Component({
  selector: 'app-ventas-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas-page.html',
  styleUrl: './ventas-page.scss',
})
export class VentasPageComponent {
  showForm = false;
  editingId: number | null = null;

  ventas: Venta[] = [];

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editVenta(venta: Venta) {
    this.editingId = venta.id;
    this.showForm = true;
  }

  deleteVenta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      this.ventas = this.ventas.filter(v => v.id !== id);
    }
  }
}
