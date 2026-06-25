import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { InventarioService } from '../../services/inventario.service';
import { HttpClient } from '@angular/common/http';
import { filter, Subscription } from 'rxjs';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-admin-productos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-product-page.html',
  styleUrl: './admin-product-page.scss',
})
export class AdminProductosPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;
  
  productos: any[] = []; 
  articulosInventario: any[] = []; 
  categoriasBD: any[] = []; 
  loading = false;
  
  form = {
    idArticulo: null as number | null,
    idCategoria: null as number | null,
    categoriaMarketplace: '',
    urlImagen: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0
  };

  // --- PAGINACIÓN ---
  currentPage: number = 1;
  itemsPerPage: number = 11; // 11 productos + 1 botón de agregar = 12 cuadros

  private routerSubscription?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private productoService: ProductoService, 
    private inventarioService: InventarioService,
    private categoriaService: CategoriaService,
    private http: HttpClient, 
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarListasDesplegables();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/productos') {
          this.cargarProductos();
          this.cargarListasDesplegables();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  // --- LÓGICA DE PAGINACIÓN ---
  get productosPaginados() {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.productos.slice(inicio, fin);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.productos.length / this.itemsPerPage));
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  // ----------------------------

  cargarListasDesplegables() {
    this.inventarioService.getAll().subscribe(data => this.articulosInventario = data);
    this.categoriaService.getAll().subscribe({
      next: (data) => this.categoriasBD = data,
      error: () => console.warn('Error al cargar categorías')
    });
  }

  cargarProductos() {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data.map((p: any) => ({
          id: p.idArticulo,
          nombre: p.idArticuloNavigation?.nombre || 'Sin nombre',
          categoria: p.categoriaMarketplace || p.idCategoriaNavigation?.nombreCategoria,
          precio: p.idArticuloNavigation?.precio || 0,
          stock: p.idArticuloNavigation?.stockDisponible || 0,
          estado: (p.idArticuloNavigation?.stockDisponible || 0) > 0 ? 'disponible' : 'agotado',
          urlImagen: p.urlImagen || '',
          rawData: p
        }));
        this.currentPage = 1; // Reiniciar paginación
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onArticuloSeleccionado() {
    if (!this.form.idArticulo) return;
    const articulo = this.articulosInventario.find(a => a.idArticulo == this.form.idArticulo);
    if (articulo) {
      this.form.nombre = articulo.nombre;
      this.form.descripcion = articulo.descripcion || 'Sin descripción';
      this.form.precio = articulo.precio;
      this.form.stock = articulo.stockDisponible;
    }
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.form = { idArticulo: null, idCategoria: null, categoriaMarketplace: '', urlImagen: '', nombre: '', descripcion: '', precio: 0, stock: 0 };
  }

  closeForm() {
    this.showForm = false;
  }

  editProducto(producto: any) {
    this.editingId = producto.id;
    const p = producto.rawData;

    this.form = {
      idArticulo: p.idArticulo,
      idCategoria: p.idCategoria,
      categoriaMarketplace: p.categoriaMarketplace,
      urlImagen: p.urlImagen || '',
      nombre: p.idArticuloNavigation?.nombre,
      descripcion: p.idArticuloNavigation?.descripcion,
      precio: p.idArticuloNavigation?.precio,
      stock: p.idArticuloNavigation?.stockDisponible
    };
    this.showForm = true;
  }

  guardarProducto() {
    if (!this.form.idArticulo || !this.form.idCategoria || !this.form.categoriaMarketplace) {
      alert("Faltan campos obligatorios para publicar el producto.");
      return;
    }

    const payload = {
      idArticulo: Number(this.form.idArticulo),
      idCategoria: Number(this.form.idCategoria),
      categoriaMarketplace: this.form.categoriaMarketplace,
      urlImagen: this.form.urlImagen
    };

    if (this.editingId) {
      this.productoService.update(this.editingId, payload).subscribe({
        next: () => { this.cargarProductos(); this.closeForm(); },
        error: (err) => alert(err.error?.mensaje || 'Error al actualizar.')
      });
    } else {
      this.productoService.create(payload).subscribe({
        next: () => { this.cargarProductos(); this.closeForm(); },
        error: (err) => alert(err.error?.mensaje || 'Error al registrar.')
      });
    }
  }

  deleteProducto(id: number) {
    if (confirm('¿Retirar producto del Marketplace?')) {
      this.productoService.delete(id).subscribe(() => this.cargarProductos());
    }
  }
}