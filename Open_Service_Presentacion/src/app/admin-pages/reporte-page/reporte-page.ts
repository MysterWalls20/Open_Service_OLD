import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteResumen } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-page.html',
  styleUrl: './reporte-page.scss',
})
export class ReportePageComponent {
  fechaInicio = '';
  fechaFin = '';

  resumen: ReporteResumen[] = [
    { titulo: 'Total Ventas', valor: '$0.00', cambio: '0%', positivo: true },
    { titulo: 'Total Pedidos', valor: '0', cambio: '0%', positivo: true },
    { titulo: 'Nuevos Clientes', valor: '0', cambio: '0%', positivo: true },
    { titulo: 'Productos Vendidos', valor: '0', cambio: '0%', positivo: true },
  ];

  filtrar() {
    console.log('Filtrando desde', this.fechaInicio, 'hasta', this.fechaFin);
  }

  exportarPDF() {
    console.log('Exportando PDF...');
  }

  exportarCSV() {
    console.log('Exportando CSV...');
  }
}
