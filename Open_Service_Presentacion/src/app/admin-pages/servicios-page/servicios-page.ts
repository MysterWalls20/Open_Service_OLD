import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../models/servicio.model';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicios-page.html',
  styleUrl: './servicios-page.scss',
})
export class ServiciosPageComponent {
  showForm = false;
  editingId: number | null = null;

  servicios: Servicio[] = [];

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editServicio(servicio: Servicio) {
    this.editingId = servicio.id;
    this.showForm = true;
  }

  deleteServicio(id: number) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.servicios = this.servicios.filter(s => s.id !== id);
    }
  }
}
