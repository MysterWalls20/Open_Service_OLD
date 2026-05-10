import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-nuevo-ticket-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nuevo-ticket-page.html',
  styleUrl: './nuevo-ticket-page.scss',
})
export class NuevoTicketPageComponent {
  form = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    marca: '',
    modelo: '',
    archivo: '',
    descripcion: '',
  };

  mensajeExito = false;

  constructor(private ticketService: TicketService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.form.archivo = input.files[0].name;
    }
  }

  guardarTicket() {
    if (!this.form.nombre || !this.form.email || !this.form.direccion || !this.form.descripcion) return;

    const ticket = this.ticketService.addTicket({
      ...this.form,
      tipoServicio: 'reparacion',
    } as Omit<Ticket, 'id' | 'fecha' | 'estado'>);

    if (ticket) {
      this.mensajeExito = true;
      this.form = { nombre: '', email: '', telefono: '', direccion: '', marca: '', modelo: '', archivo: '', descripcion: '' };
      setTimeout(() => this.mensajeExito = false, 4000);
    }
  }
}
