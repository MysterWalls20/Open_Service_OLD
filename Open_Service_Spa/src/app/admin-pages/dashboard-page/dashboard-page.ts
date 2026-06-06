import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { ServicioService } from '../../services/servicio.service';
import { PedidoService } from '../../services/pedido.service';
import { forkJoin, of } from 'rxjs'; 
import { catchError, finalize } from 'rxjs/operators';

// 👇 IMPORTAMOS CHART.JS
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface StatCard { label: string; value: number; icon: string; color: string; }
interface RecentOrder { id: string; status: string; date: string; statusClass: string; }

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPageComponent implements OnInit {
  loading = true; 
  chartInstancia: any; // Guardamos el gráfico para destruirlo si se recarga

  stats: StatCard[] = [
    { label: 'Clientes', value: 0, icon: '👥', color: 'users' },
    { label: 'Productos', value: 0, icon: '📦', color: 'products' },
    { label: 'Servicios Activos', value: 0, icon: '🔧', color: 'services' },
    { label: 'Total Pedidos', value: 0, icon: '📋', color: 'orders' },
  ];

  recentOrders: RecentOrder[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private servicioService: ServicioService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;

    forkJoin({
      clientes: this.clienteService.getAll().pipe(catchError(() => of([]))),
      productos: this.productoService.getAll().pipe(catchError(() => of([]))),
      servicios: this.servicioService.getAll().pipe(catchError(() => of([]))),
      pedidos: this.pedidoService.getAll().pipe(catchError(() => of([])))
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); 
      })
    )
    .subscribe({
      next: (resultados: any) => {
        this.stats[0].value = resultados.clientes.length || 0;
        this.stats[1].value = resultados.productos.length || 0;
        const serviciosActivos = resultados.servicios.filter((s:any) => s.estado === 'Activo' || s.estado === 'En proceso');
        this.stats[2].value = serviciosActivos.length || 0;
        this.stats[3].value = resultados.pedidos.length || 0;

        const ultimos = [...resultados.pedidos].sort((a:any, b:any) => b.idPedido - a.idPedido).slice(0, 5);
        this.recentOrders = ultimos.map((p: any) => ({
          id: `TK-${p.idPedido.toString().padStart(5, '0')}`,
          status: p.estado,
          date: new Date(p.fechaRegistro).toLocaleDateString('es-PE'),
          statusClass: this.getStatusClass(p.estado)
        }));

        // Dibujamos el gráfico dándole un pequeño retraso para asegurar que el HTML ya exista
        setTimeout(() => this.dibujarGrafico(resultados.pedidos), 50);
      }
    });
  }

  dibujarGrafico(pedidos: any[]) {
    if (this.chartInstancia) this.chartInstancia.destroy();

    // Obtener los últimos 7 días
    const labels = [];
    const data = [];
    const hoy = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      const fechaString = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      labels.push(fechaString);

      // Contar pedidos de este día
      const cuenta = pedidos.filter(p => new Date(p.fechaRegistro).toDateString() === d.toDateString()).length;
      data.push(cuenta);
    }

    const canvas = document.getElementById('dashboardChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chartInstancia = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nuevos Pedidos',
          data: data,
          backgroundColor: '#4452cc',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  getStatusClass(estado: string): string {
    const est = estado?.toLowerCase() || '';
    if (est === 'completado') return 'completed';
    if (est === 'en proceso' || est === 'activo') return 'in-progress';
    if (est === 'cancelado' || est === 'anulado') return 'danger';
    return 'pending';
  }
}