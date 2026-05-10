import { Injectable } from '@angular/core';
import { Ticket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly STORAGE_KEY = 'service_tickets';

  getTickets(): Ticket[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  addTicket(ticket: Omit<Ticket, 'id' | 'fecha' | 'estado'>): Ticket {
    const tickets = this.getTickets();
    const newTicket: Ticket = {
      ...ticket,
      direccion: ticket.direccion || '',
      marca: ticket.marca || '',
      modelo: ticket.modelo || '',
      archivo: ticket.archivo || '',
      id: Date.now(),
      fecha: new Date().toLocaleDateString('es-PE'),
      estado: 'pendiente',
    };
    tickets.push(newTicket);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tickets));
    return newTicket;
  }

  updateEstado(id: number, estado: Ticket['estado']): void {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      tickets[idx].estado = estado;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tickets));
    }
  }
}
