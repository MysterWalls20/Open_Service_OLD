import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { finalize } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ReporteResumen } from '../../models/reporte.model';

// 👇 IMPORTAMOS CHART.JS
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-reporte-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-page.html',
  styleUrl: './reporte-page.scss',
})
export class ReportePageComponent implements OnInit {
  loading = true;
  fechaInicio = '';
  fechaFin = '';

  ventasCrudas: any[] = []; 
  ventasFiltradas: any[] = []; 

  // Instancias de los gráficos
  chartVentas: any;
  chartOperaciones: any;
  chartOrigen: any;
  chartPagos: any;

  resumen: ReporteResumen[] = [
    { titulo: 'Ingresos Totales', valor: 'S/ 0.00', cambio: '', positivo: true },
    { titulo: 'Operaciones (Ventas)', valor: '0', cambio: '', positivo: true },
    { titulo: 'Ticket Promedio', valor: 'S/ 0.00', cambio: '', positivo: true }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private ventaService: VentaService
  ) {}

  ngOnInit() {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaInicio = primerDia.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];

    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.ventaService.getAll()
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); 
      })
    )
    .subscribe({
      next: (data) => {
        this.ventasCrudas = data || [];
        this.filtrar(); 
      },
      error: (err) => console.error('Error cargando ventas', err)
    });
  }

  filtrar() {
    if (!this.fechaInicio || !this.fechaFin) return;

    const fInicio = new Date(this.fechaInicio + 'T00:00:00');
    const fFin = new Date(this.fechaFin + 'T23:59:59');

    this.ventasFiltradas = this.ventasCrudas.filter(v => {
      const fechaBase = v.fechaVenta || v.fechaRegistro;
      if (!fechaBase) return false;
      const fechaVenta = new Date(fechaBase);
      return fechaVenta >= fInicio && fechaVenta <= fFin;
    });

    this.calcularMetricas();
    
    // Dibujamos los gráficos con un ligero retraso para que el HTML cargue los <canvas>
    setTimeout(() => this.dibujarGraficos(), 50);
  }

  calcularMetricas() {
    const totalIngresos = this.ventasFiltradas.reduce((sum, v) => sum + (v.montoTotal || 0), 0);
    const totalOperaciones = this.ventasFiltradas.length;
    const ticketPromedio = totalOperaciones > 0 ? (totalIngresos / totalOperaciones) : 0;

    this.resumen[0].valor = `S/ ${totalIngresos.toFixed(2)}`;
    this.resumen[1].valor = `${totalOperaciones}`;
    this.resumen[2].valor = `S/ ${ticketPromedio.toFixed(2)}`;
  }

  // =====================================
  // DIBUJADO DE GRÁFICOS (CHART.JS)
  // =====================================
  dibujarGraficos() {
    // Destruir gráficos anteriores si existen (Vital en Chart.js)
    if (this.chartVentas) this.chartVentas.destroy();
    if (this.chartOperaciones) this.chartOperaciones.destroy();
    if (this.chartOrigen) this.chartOrigen.destroy();
    if (this.chartPagos) this.chartPagos.destroy();

    // 1. Agrupar datos por fecha
    const datosPorFecha: any = {};
    const origenSuma: any = { 'Servicio Técnico': 0, 'Venta Directa Admin': 0, 'Marketplace': 0 };
    const pagoSuma: any = {};

    this.ventasFiltradas.forEach(v => {
      // Fechas
      const fecha = new Date(v.fechaVenta || v.fechaRegistro).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      if (!datosPorFecha[fecha]) datosPorFecha[fecha] = { ingresos: 0, cantidad: 0 };
      datosPorFecha[fecha].ingresos += v.montoTotal;
      datosPorFecha[fecha].cantidad += 1;

      // Origen
      const origen = v.origenVenta || 'Otros';
      if (origenSuma[origen] !== undefined) origenSuma[origen] += v.montoTotal;
      else origenSuma[origen] = v.montoTotal;

      // Métodos de Pago
      const metodo = v.idTipoPagoNavigation?.descripcion || 'No especificado';
      if (!pagoSuma[metodo]) pagoSuma[metodo] = 0;
      pagoSuma[metodo] += v.montoTotal;
    });

    const fechasLabels = Object.keys(datosPorFecha);
    const ingresosData = fechasLabels.map(f => datosPorFecha[f].ingresos);
    const cantidadData = fechasLabels.map(f => datosPorFecha[f].cantidad);

    // GRÁFICO 1: Ingresos (Líneas)
    const ctxVentas = document.getElementById('ventasChart') as HTMLCanvasElement;
    if (ctxVentas) {
      this.chartVentas = new Chart(ctxVentas, {
        type: 'line',
        data: {
          labels: fechasLabels,
          datasets: [{ label: 'Ingresos (S/)', data: ingresosData, borderColor: '#4452cc', backgroundColor: 'rgba(68, 82, 204, 0.1)', fill: true, tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // GRÁFICO 2: Operaciones (Barras)
    const ctxOp = document.getElementById('operacionesChart') as HTMLCanvasElement;
    if (ctxOp) {
      this.chartOperaciones = new Chart(ctxOp, {
        type: 'bar',
        data: {
          labels: fechasLabels,
          datasets: [{ label: 'N° de Ventas', data: cantidadData, backgroundColor: '#28a745', borderRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { stepSize: 1 } } } }
      });
    }

    // GRÁFICO 3: Origen (Pie)
    const ctxOrigen = document.getElementById('origenChart') as HTMLCanvasElement;
    if (ctxOrigen) {
      this.chartOrigen = new Chart(ctxOrigen, {
        type: 'pie',
        data: {
          labels: Object.keys(origenSuma),
          datasets: [{ data: Object.values(origenSuma), backgroundColor: ['#ffc107', '#4452cc', '#17a2b8', '#6c757d'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // GRÁFICO 4: Métodos de Pago (Doughnut)
    const ctxPago = document.getElementById('pagoChart') as HTMLCanvasElement;
    if (ctxPago) {
      this.chartPagos = new Chart(ctxPago, {
        type: 'doughnut',
        data: {
          labels: Object.keys(pagoSuma),
          datasets: [{ data: Object.values(pagoSuma), backgroundColor: ['#dc3545', '#20c997', '#fd7e14', '#6f42c1'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  //(Métodos exportarPDF y exportarCSV) 
  exportarPDF() {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(68, 82, 204);
    doc.text('Reporte de Ingresos - Open Service', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${this.fechaInicio} al ${this.fechaFin}`, 14, 28);
    doc.text(`Total Ingresos: ${this.resumen[0].valor}`, 14, 34);
    doc.text(`Operaciones Totales: ${this.resumen[1].valor}`, 14, 40);

    const cuerpoTabla = this.ventasFiltradas.map(v => [
      v.idVenta,
      v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString() : 'N/A',
      v.origenVenta || 'N/A',
      v.idTipoPagoNavigation?.descripcion || 'N/A',
      `S/ ${(v.montoTotal || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['ID Venta', 'Fecha', 'Origen', 'Método Pago', 'Total']],
      body: cuerpoTabla,
      theme: 'grid',
      headStyles: { fillColor: [68, 82, 204] }
    });

    doc.save(`Reporte_Ventas_${this.fechaInicio}_al_${this.fechaFin}.pdf`);
  }

  exportarCSV() {
    if (this.ventasFiltradas.length === 0) {
      alert('No hay datos para exportar en este rango de fechas.');
      return;
    }

    let csvContent = "ID Venta,Fecha,Cliente,Origen,Metodo Pago,IGV,Total\n";

    this.ventasFiltradas.forEach(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString() : 'N/A';
      const cliente = v.idClienteNavigation ? `${v.idClienteNavigation.nombres} ${v.idClienteNavigation.apellidos}` : 'N/A';
      const origen = v.origenVenta || 'N/A';
      const metodo = v.idTipoPagoNavigation?.descripcion || 'N/A';
      const igv = v.igv || 0;
      const total = v.montoTotal || 0;

      csvContent += `${v.idVenta},${fecha},"${cliente}",${origen},${metodo},${igv},${total}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Ventas_${this.fechaInicio}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}