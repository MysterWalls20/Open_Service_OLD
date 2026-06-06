import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service'; 
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.scss',
})
export class ProductosPageComponent implements OnInit {
  searchQuery = '';
  selectedCategory = 'todas'; // Filtro seleccionado
  
  categoriasBD: any[] = []; // Guardará las categorías de SQL Server
  productos: any[] = [];
  loading = true;
  
  // Novedad: Contador en tiempo real para el botón del carrito
  cantidadCarrito: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarCatalogo();

    // Nos suscribimos al carrito para saber cuántos items hay en todo momento
    this.carritoService.carrito$.subscribe(items => {
      // Suma la cantidad total de productos
      this.cantidadCarrito = items.length;
      //this.cantidadCarrito = items.reduce((total, item) => total + item.cantidad, 0);
    });
  }

  cargarCategorias() {
    // Traemos los botones de categoría reales desde la BD
    this.categoriaService.getAll().subscribe({
      next: (data) => this.categoriasBD = data,
      error: () => console.warn('Error al cargar categorías de la BD')
    });
  }

  cargarCatalogo() {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data.map((p: any) => ({
          id: p.idArticulo,
          nombre: p.idArticuloNavigation?.nombre || 'Producto sin nombre',
          descripcion: p.idArticuloNavigation?.descripcion || 'Sin descripción',
          precio: p.idArticuloNavigation?.precio || 0,
          stock: p.idArticuloNavigation?.stockDisponible || 0,
          categoriaMarketplace: p.categoriaMarketplace, // El nombre de la categoría del Marketplace
          
          // 👇 ADAPTACIÓN 1: Guardamos la categoría real de la BD para usarla en el filtro
          categoriaBD: p.idCategoriaNavigation?.nombreCategoria || 'General', 
          
          urlImagen: p.urlImagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el catálogo:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter que filtra los productos en tiempo real por búsqueda y por los botones de la BD
  get filteredProducts() {
    return this.productos.filter(p => {
      // 👇 ADAPTACIÓN 2: Ahora comparamos con categoriaBD (la tabla de C#) en lugar de categoriaMarketplace
      const matchCategory = this.selectedCategory === 'todas' || p.categoriaBD === this.selectedCategory;
      const query = this.searchQuery.toLowerCase();
      // Busca en el nombre y en la descripción
      const matchSearch = !query || 
                          p.nombre.toLowerCase().includes(query) || 
                          p.descripcion.toLowerCase().includes(query);
                          
      return matchCategory && matchSearch;
    });
  }

  filterByCategory(categoryName: string) {
    this.selectedCategory = categoryName;
  }

  verDetalle(producto: any) {
    this.router.navigate(['/producto', producto.id], { state: { productoInfo: producto } });
  }

  agregarAlCarritoRapido(producto: any, event: Event) {
    event.stopPropagation(); // Evita que se dispare el "Ver Detalle" de la tarjeta
    
    if (producto.stock <= 0) return;

    this.carritoService.agregarAlCarrito({
      idArticulo: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      imagen: producto.urlImagen,
      stockMaximo: producto.stock
    });
  }

  // Nuevo método para el botón superior
  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }
}