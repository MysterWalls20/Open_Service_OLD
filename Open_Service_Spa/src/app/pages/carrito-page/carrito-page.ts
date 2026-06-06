import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../services/carrito.service'; // Ajusta la ruta a tu servicio

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito-page.html',
  styleUrl: './carrito-page.scss'
})
export class CarritoPageComponent implements OnInit {
  itemsCarrito: ItemCarrito[] = [];
  totalCarrito: number = 0;

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    // Nos suscribimos para escuchar los cambios en tiempo real
    this.carritoService.carrito$.subscribe(items => {
      this.itemsCarrito = items;
      this.totalCarrito = this.carritoService.obtenerTotal();
    });
  }

  eliminarItem(idArticulo: number) {
    this.carritoService.eliminarDelCarrito(idArticulo);
  }

  vaciarCarrito() {
    if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  seguirComprando() {
    this.router.navigate(['/catalogo']); // Cambia a la ruta de tu marketplace
  }

  procederAlPago() {
      if (this.itemsCarrito.length === 0) return;
      this.router.navigate(['/checkout']);
    }
}