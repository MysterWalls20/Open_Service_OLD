import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio.service';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { RepuestoService } from '../../services/repuesto.service'; 
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios-page.html',
  styleUrl: './servicios-page.scss',
})
export class ServiciosPageComponent implements OnInit, OnDestroy {
  showForm = false;
  servicios: any[] = [];
  loading = false;

  ticketsPendientes: any[] = [];
  tecnicos: any[] = [];
  articulos: any[] = [];

  filtroEstado = '';
  filtroTecnico = '';
  filtroTicket = '';

  form = {
    idPedido: null as number | null,
    idEmpleado: null as number | null,
    diagnosticoTecnico: '',
    totalServicio: 0,
    estado: 'Activo', // Estado interno por defecto
    horaInicio: '',
    horaFin: '',
    fechaServicio: ''
  };

  detallesServicio: any[] = [];
  consumoRepuestos: any[] = [];

  nuevoDetalle = { descripcion: '', costo: null as number | null };
  nuevoRepuesto = { idArticulo: null as number | null, cantidad: 1 };

  private routerSubscription?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private servicioService: ServicioService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private repuestoService: RepuestoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarServicios();
    this.cargarListasDesplegables();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/servicios') {
          this.cargarServicios();
          this.cargarListasDesplegables();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarListasDesplegables() {
    this.pedidoService.getAll().subscribe(data => {
      this.ticketsPendientes = data.filter(p =>
        p.estado.toLowerCase() === 'pendiente' ||
        p.estado.toLowerCase() === 'nuevo'
      );
    });

    this.authService.obtenerEmpleados().subscribe({
      next: (empleados) => {
        this.tecnicos = empleados.map(e => ({
          idEmpleado: e.idEmpleado || e.id || 0, 
          nombreCompleto: `${e.nombres} ${e.apellidos}`
        }));
      },
      error: () => console.error('Error al cargar empleados')
    });

    this.repuestoService.getAll().subscribe({
      next: (data) => { 
        this.articulos = data.map((r: any) => ({
          idArticulo: r.idArticulo,
          nombre: r.idArticuloNavigation?.nombre || 'Repuesto sin nombre',
          precio: r.idArticuloNavigation?.precio || 0,
          stockDisponible: r.idArticuloNavigation?.stockDisponible || 0
        }));
      },
      error: () => console.error('Error al cargar repuestos')
    });
  }

  cargarServicios() {
    this.loading = true;
    this.servicioService.getAll().subscribe({
      next: (data) => {
        this.servicios = data.map((s: any) => ({
          ...s,
          id: s.idServicio,
          ticketFormat: `TK-${s.idPedido.toString().padStart(5, '0')}`,
          tecnico: s.idEmpleadoNavigation
            ? `${s.idEmpleadoNavigation.nombres} ${s.idEmpleadoNavigation.apellidos}`
            : `ID: ${s.idEmpleado}`,
          descripcion: s.diagnosticoTecnico || 'Sin diagnóstico',
          precio: s.totalServicio,
          fecha: s.fechaServicio ? new Date(s.fechaServicio).toLocaleDateString('es-PE') : 'N/A',
          estadoVisual: (s.estado || '').toLowerCase(),
          estadoReal: s.estado,
          detalles: s.detalleServicios || [],
          repuestos: s.consumoRepuestos || []
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredServicios() {
    return this.servicios.filter(s => {
      const matchEstado = !this.filtroEstado || s.estadoReal === this.filtroEstado;
      const matchTecnico = !this.filtroTecnico || s.idEmpleado === Number(this.filtroTecnico);
      const matchTicket = !this.filtroTicket || s.idPedido === Number(this.filtroTicket);
      return matchEstado && matchTecnico && matchTicket;
    });
  }

  openForm() {
    this.showForm = true;
    const now = new Date();
    this.form = {
      idPedido: null,
      idEmpleado: null,
      diagnosticoTecnico: '',
      totalServicio: 0,
      estado: 'Activo', // Siempre nace como Activo desde el frontend
      horaInicio: now.toTimeString().slice(0, 5),
      horaFin: '',
      fechaServicio: now.toISOString().slice(0, 10)
    };
    this.detallesServicio = [];
    this.consumoRepuestos = [];
  }

  closeForm() {
    this.showForm = false;
  }

  getArticuloNombre(idArticulo: number): string {
    const art = this.articulos.find(a => a.idArticulo === idArticulo);
    return art ? art.nombre : `ID: ${idArticulo}`;
  }

  agregarDetalle() {
    if (!this.nuevoDetalle.descripcion || !this.nuevoDetalle.costo) return;
    this.detallesServicio.push({
      descripcion: this.nuevoDetalle.descripcion,
      costo: this.nuevoDetalle.costo
    });
    this.nuevoDetalle = { descripcion: '', costo: null };
    this.recalcularTotal();
  }

  quitarDetalle(index: number) {
    this.detallesServicio.splice(index, 1);
    this.recalcularTotal();
  }

  agregarRepuesto() {
    if (!this.nuevoRepuesto.idArticulo || !this.nuevoRepuesto.cantidad) return;

    const articulo = this.articulos.find(a => a.idArticulo === this.nuevoRepuesto.idArticulo);
    const precio = articulo ? articulo.precio : 0;
    const subtotal = precio * this.nuevoRepuesto.cantidad;

    this.consumoRepuestos.push({
      idArticulo: this.nuevoRepuesto.idArticulo,
      nombreArticulo: articulo ? articulo.nombre : `ID: ${this.nuevoRepuesto.idArticulo}`,
      cantidad: this.nuevoRepuesto.cantidad,
      subtotal: subtotal
    });

    this.nuevoRepuesto = { idArticulo: null, cantidad: 1 };
    this.recalcularTotal();
  }

  quitarRepuesto(index: number) {
    this.consumoRepuestos.splice(index, 1);
    this.recalcularTotal();
  }

  recalcularTotal() {
    const sumaDetalles = this.detallesServicio.reduce((sum, det) => sum + (det.costo || 0), 0);
    const sumaRepuestos = this.consumoRepuestos.reduce((sum, rep) => sum + (rep.subtotal || 0), 0);
    this.form.totalServicio = sumaDetalles + sumaRepuestos;
  }

  guardarServicio() {
    if (!this.form.idPedido || !this.form.idEmpleado) {
      alert('Debes seleccionar un Ticket Base y un Técnico Asignado.');
      return;
    }

    const payload = {
      idPedido: this.form.idPedido,
      idEmpleado: this.form.idEmpleado,
      diagnosticoTecnico: this.form.diagnosticoTecnico || '',
      totalServicio: Number(this.form.totalServicio) || 0,
      estado: this.form.estado, // Enviará 'Activo'
      horaInicio: this.form.horaInicio || null,
      horaFin: this.form.horaFin || null,
      fechaServicio: this.form.fechaServicio ? new Date(this.form.fechaServicio).toISOString() : null,
      detalles: this.detallesServicio.map(d => ({
        descripcionTarea: d.descripcion,
        costoManoObra: d.costo
      })),
      consumoRepuestos: this.consumoRepuestos.map(r => ({
        idArticulo: r.idArticulo,
        cantidad: r.cantidad,
        subtotal: r.subtotal
      }))
    };

    console.log("DATOS ENVIADOS A C#:", payload);

    this.servicioService.create(payload).subscribe({
      next: () => {
        this.cargarServicios();
        this.cargarListasDesplegables();
        this.closeForm();
      },
      error: (err) => {
        const msg = err.error?.mensaje || 'Error desconocido';
        const detalle = err.error?.detalle || '';
        alert(`NO SE PUDO CREAR:\n${msg}\n\nDetalle: ${detalle}`);
      }
    });
  }

  deleteServicio(id: number) {
    if (confirm('¿Estás seguro de eliminar este registro de servicio?')) {
      this.servicioService.delete(id).subscribe({
        next: () => {
          alert('Servicio eliminado.');
          this.cargarServicios();
        },
        error: (err) => alert('No se puede eliminar porque ya está vinculado a una Venta.')
      });
    }
  }
}