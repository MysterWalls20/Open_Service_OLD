import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RepuestoService } from '../../services/repuesto.service';
import { InventarioService } from '../../services/inventario.service'; 
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-repuestos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repuestos-page.html',
  styleUrl: './repuestos-page.scss',
})
export class RepuestosPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;
  repuestos: any[] = [];
  catalogoInventario: any[] = []; // Nueva lista para el combobox
  loading = false;
  
  form = {
    idArticulo: null as number | null,
    compatibilidad: ''
  };

  private routerSubscription?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private repuestoService: RepuestoService, 
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarRepuestos();
    this.cargarInventario(); // Cargamos el inventario al iniciar

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/repuestos') {
          this.cargarRepuestos();
          this.cargarInventario();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarInventario() {
    this.inventarioService.getAll().subscribe({
      next: (data) => { this.catalogoInventario = data; },
      error: (err) => console.error('Error al cargar inventario base', err)
    });
  }

  cargarRepuestos() {
    this.loading = true;
    this.repuestoService.getAll().subscribe({
      next: (data) => {
        this.repuestos = data.map((r: any) => ({
          ...r,
          id: r.idArticulo,
          nombre: r.idArticuloNavigation?.nombre || 'Sin nombre',
          precio: r.idArticuloNavigation?.precio || 0,
          stock: r.idArticuloNavigation?.stockDisponible || 0,
          compatibilidad: r.compatibilidadMarca || 'Genérico',
          estado: (r.idArticuloNavigation?.stockDisponible || 0) > 0 ? 'disponible' : 'agotado'
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar repuestos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.form = { idArticulo: null, compatibilidad: '' };
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editRepuesto(r: any) {
    this.editingId = r.id;
    this.form = {
      idArticulo: r.id,
      compatibilidad: r.compatibilidad
    };
    this.showForm = true;
  }

  deleteRepuesto(id: number) {
    if (confirm('¿Estás seguro de quitar este artículo de la lista de repuestos? (No se borrará del inventario principal)')) {
      this.repuestoService.delete(id).subscribe({
        next: () => this.cargarRepuestos(),
        error: (err) => alert('Error al eliminar repuesto')
      });
    }
  }

  guardarRepuesto() {
    if (!this.form.idArticulo) {
      alert("Debe seleccionar un artículo del inventario.");
      return;
    }

    // PAYLOAD CORREGIDO
    const payload = {
      // Si estamos editando, usamos editingId. Si creamos, usamos el que eligió en el combo.
      idArticulo: this.editingId ? this.editingId : this.form.idArticulo, 
      compatibilidadMarca: this.form.compatibilidad || 'Genérico'
    };

    if (this.editingId) {
      this.repuestoService.update(this.editingId, payload).subscribe({
        next: () => { this.cargarRepuestos(); this.closeForm(); },
        error: (err) => alert(err.error?.mensaje || 'Error al actualizar')
      });
    } else {
      this.repuestoService.create(payload).subscribe({
        next: () => { this.cargarRepuestos(); this.closeForm(); },
        error: (err) => alert(err.error?.mensaje || 'Error al clasificar como repuesto')
      });
    }
  }
}