import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.scss'
})
export class ProductoDetalleComponent implements OnInit {
  producto: any = null;
  loading = true;
  cantidadSeleccionada = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {
    // MAGIA DE OPTIMIZACIÓN: Leemos si el catálogo nos mandó la data por la memoria
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['productoInfo']) {
      this.producto = navigation.extras.state['productoInfo'];
      this.loading = false; // Como ya tenemos la data, quitamos la pantalla de carga al instante
    }
  }

  ngOnInit() {
    // Si NO hay producto (porque el cliente refrescó la página con F5 o pegó la URL directamente),
    // recién ahí hacemos la consulta lenta a la base de datos.
    if (!this.producto) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.cargarDetalleProducto(Number(id));
      }
    }
  }

  cargarDetalleProducto(id: number) {
    this.productoService.getById(id).subscribe({
      next: (p: any) => {
        this.producto = {
          id: p.idArticulo,
          nombre: p.idArticuloNavigation?.nombre || 'Producto',
          descripcion: p.idArticuloNavigation?.descripcion || 'Sin descripción detallada.',
          precio: p.idArticuloNavigation?.precio || 0,
          stock: p.idArticuloNavigation?.stockDisponible || 0,
          categoriaMarketplace: p.categoriaMarketplace || 'General',
          urlImagen: p.urlImagen || 'https://via.placeholder.com/600x400?text=Sin+Imagen'
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error del backend:', err);
        alert('Hubo un error al cargar el producto directamente.');
        this.volverAlCatalogo();
      }
    });
  }

  aumentarCantidad() {
    if (this.cantidadSeleccionada < this.producto.stock) {
      this.cantidadSeleccionada++;
    }
  }

  disminuirCantidad() {
    if (this.cantidadSeleccionada > 1) {
      this.cantidadSeleccionada--;
    }
  }

  agregarAlCarrito() {
    if (!this.producto || this.producto.stock === 0) return;

    this.carritoService.agregarAlCarrito({
      idArticulo: this.producto.id,
      nombre: this.producto.nombre,
      precio: this.producto.precio,
      cantidad: this.cantidadSeleccionada,
      imagen: this.producto.urlImagen,
      stockMaximo: this.producto.stock
    });
  }

  volverAlCatalogo() {
    this.router.navigate(['/productos']); 
  }
}