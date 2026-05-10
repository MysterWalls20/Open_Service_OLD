import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
}

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-page.html',
  styleUrl: './clientes-page.scss',
})
export class ClientesPageComponent {
  showForm = false;
  editingId: number | null = null;

  clientes: Cliente[] = [];

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editCliente(cliente: Cliente) {
    this.editingId = cliente.id;
    this.showForm = true;
  }

  deleteCliente(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clientes = this.clientes.filter(c => c.id !== id);
    }
  }
}
