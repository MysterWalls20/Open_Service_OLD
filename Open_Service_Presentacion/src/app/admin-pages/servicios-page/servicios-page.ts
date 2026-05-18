import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Servicio } from '../../models/servicio.model';
import { ServicioService } from '../../services/servicio.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicios-page.html',
  styleUrl: './servicios-page.scss',
})
export class ServiciosPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;

  servicios: Servicio[] = [];
  loading = false;

  private routerSubscription?: Subscription;

  constructor(private servicioService: ServicioService, private router: Router) {}

  ngOnInit() {
    this.cargarServicios();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/servicios') {
          this.cargarServicios();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarServicios() {
    this.loading = true;
    this.servicioService.getAll().subscribe({
      next: (data) => {
        this.servicios = data.map((s: any) => ({
          id: s.idServicio,
          nombre: `Orden #${s.idPedido}`,
          descripcion: s.diagnosticoTecnico || 'Sin diagnóstico',
          precio: s.totalServicio,
          duracion: s.horaInicio && s.horaFin ? `${s.horaInicio} - ${s.horaFin}` : 'N/A',
          estado: s.estado === 'Completado' ? ('inactivo' as const) : ('activo' as const)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios', err);
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

  editServicio(servicio: Servicio) {
    this.editingId = servicio.id;
    this.showForm = true;
  }

  deleteServicio(id: number) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.servicioService.delete(id).subscribe({
        next: () => this.cargarServicios(),
        error: (err) => console.error('Error al eliminar servicio', err)
      });
    }
  }
}
