import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios-page.html',
  styleUrl: './servicios-page.scss',
})
export class ServiciosPageComponent {
  tickets: Ticket[] = [];

  form = {
    nombre: '',
    email: '',
    telefono: '',
    tipoServicio: 'reparacion' as 'reparacion' | 'mantenimiento',
    descripcion: '',
  };

  constructor(private ticketService: TicketService) {
    this.tickets = this.ticketService.getTickets();
  }

  generarTicket() {
    if (!this.form.nombre || !this.form.email || !this.form.descripcion) return;

    const ticket = this.ticketService.addTicket({ ...this.form });
    this.tickets.unshift(ticket);
    this.form = { nombre: '', email: '', telefono: '', tipoServicio: 'reparacion', descripcion: '' };
  }
}
