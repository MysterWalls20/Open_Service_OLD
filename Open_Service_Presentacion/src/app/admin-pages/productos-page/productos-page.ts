import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.scss',
})
export class ProductosPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;

  productos: Producto[] = [];
  loading = false;

  private routerSubscription?: Subscription;

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit() {
    this.cargarProductos();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/productos') {
          this.cargarProductos();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarProductos() {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data.map((p: any) => ({
          id: p.idArticulo,
          nombre: p.idArticuloNavigation?.nombre || 'Sin nombre',
          categoria: p.idCategoriaNavigation?.nombreCategoria || 'Sin categoría',
          precio: p.idArticuloNavigation?.precio || 0,
          stock: p.idArticuloNavigation?.stockDisponible || 0,
          estado: (p.idArticuloNavigation?.stockDisponible || 0) > 0 ? 'disponible' as const : 'agotado' as const
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
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

  editProducto(producto: Producto) {
    this.editingId = producto.id;
    this.showForm = true;
  }

  deleteProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.delete(id).subscribe({
        next: () => this.cargarProductos(),
        error: (err) => console.error('Error al eliminar producto', err)
      });
    }
  }
}
