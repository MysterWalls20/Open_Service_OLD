import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Proveedor } from '../../models/proveedor.model';

@Component({
  selector: 'app-proveedor-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proveedor-page.html',
  styleUrl: './proveedor-page.scss',
})
export class ProveedorPageComponent {
  showForm = false;
  editingId: number | null = null;

  proveedores: Proveedor[] = [];

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editProveedor(proveedor: Proveedor) {
    this.editingId = proveedor.id;
    this.showForm = true;
  }

  deleteProveedor(id: number) {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.proveedores = this.proveedores.filter(p => p.id !== id);
    }
  }
}
