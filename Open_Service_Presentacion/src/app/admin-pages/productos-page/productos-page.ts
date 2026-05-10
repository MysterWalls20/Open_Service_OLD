import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.scss',
})
export class ProductosPageComponent {
  showForm = false;
  editingId: number | null = null;

  productos: Producto[] = [];

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editProducto(producto: Producto) {
    this.editingId = producto.id;
    this.showForm = true;
  }

  deleteProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
    }
  }
}
