import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Ticket } from '../../models/ticket.model';
import { Reporte } from '../../models/reporte.model';
import { TicketService } from '../../services/ticket.service';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './servicios-page.html',
  styleUrl: './servicios-page.scss',
})
export class ServiciosPageComponent {
  tickets: Ticket[] = [];
  reportes: Reporte[] = [];

  constructor(
    private ticketService: TicketService,
    private reporteService: ReporteService,
  ) {
    this.tickets = this.ticketService.getTickets();
    this.reportes = this.reporteService.getReportes();
  }
}
