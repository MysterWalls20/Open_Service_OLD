import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Inventario {
  id: number;
  producto: string;
  sku: string;
  cantidad: number;
  minimo: number;
  ubicacion: string;
  estado: 'ok' | 'bajo';
}

@Component({
  selector: 'app-inventario-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario-page.html',
  styleUrl: './inventario-page.scss',
})
export class InventarioPageComponent {
  showForm = false;
  editingId: number | null = null;

  inventario: Inventario[] = [];

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editItem(item: Inventario) {
    this.editingId = item.id;
    this.showForm = true;
  }

  deleteItem(id: number) {
    if (confirm('¿Estás seguro de eliminar este registro de inventario?')) {
      this.inventario = this.inventario.filter(i => i.id !== id);
    }
  }
}
