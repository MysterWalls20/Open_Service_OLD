import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-ventas-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas-page.html',
  styleUrl: './ventas-page.scss',
})
export class VentasPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;

  ventas: Venta[] = [];
  loading = false;

  private routerSubscription?: Subscription;

  constructor(private ventaService: VentaService, private router: Router) {}

  ngOnInit() {
    this.cargarVentas();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/ventas') {
          this.cargarVentas();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarVentas() {
    this.loading = true;
    this.ventaService.getAll().subscribe({
      next: (data) => {
        this.ventas = data.map((v: any) => ({
          id: v.idVenta,
          cliente: v.idClienteNavigation ? `${v.idClienteNavigation.nombres} ${v.idClienteNavigation.apellidos}` : 'N/A',
          producto: 'Ver detalle',
          cantidad: 1,
          precioUnitario: v.montoTotal,
          total: v.montoTotal,
          fecha: v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString() : 'N/A',
          metodoPago: v.idTipoPagoNavigation?.descripcion || 'N/A'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar ventas', err);
        this.loading = false;
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editVenta(venta: Venta) {
    this.editingId = venta.id;
    this.showForm = true;
  }

  deleteVenta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      this.ventaService.delete(id).subscribe({
        next: () => this.cargarVentas(),
        error: (err) => console.error('Error al eliminar venta', err)
      });
    }
  }
}
