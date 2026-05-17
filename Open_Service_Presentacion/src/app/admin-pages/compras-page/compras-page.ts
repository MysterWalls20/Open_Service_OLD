import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Compra } from '../../models/compra.model';

@Component({
  selector: 'app-compras-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras-page.html',
  styleUrl: './compras-page.scss',
})
export class ComprasPageComponent {
  showForm = false;
  editingId: number | null = null;

  formModel: Partial<Compra> = {};

  compras: Compra[] = [];

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.formModel = {};
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.formModel = {};
  }

  editCompra(compra: Compra) {
    this.editingId = compra.id;
    this.formModel = { ...compra };
    this.showForm = true;
  }

  deleteCompra(id: number) {
    if (confirm('¿Estás seguro de eliminar esta compra?')) {
      this.compras = this.compras.filter(c => c.id !== id);
    }
  }

  saveCompra() {
    if (this.editingId) {
      const index = this.compras.findIndex(c => c.id === this.editingId);
      if (index !== -1) {
        this.compras[index] = { ...this.formModel as Compra, id: this.editingId };
      }
    } else {
      const newId = this.compras.length > 0 ? Math.max(...this.compras.map(c => c.id)) + 1 : 1;
      this.compras.push({ ...this.formModel as Compra, id: newId });
    }
    this.closeForm();
  }
}
