import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss'
})
export class CheckoutPageComponent implements OnInit {
  itemsCarrito: ItemCarrito[] = [];
  total: number = 0;
  procesando = false;

  cliente = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: 'Trujillo', 
    idTipoPago: 1 
  };

  constructor(
    private carritoService: CarritoService,
    private ventaService: VentaService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(items => {
      this.itemsCarrito = items;
      this.total = this.carritoService.obtenerTotal();
    });

    if (this.itemsCarrito.length === 0) {
      this.router.navigate(['/productos']);
    }
  }

  confirmarCompra() {
    if (!this.cliente.nombres || !this.cliente.apellidos || !this.cliente.correo || !this.cliente.direccion) {
      alert('Por favor, completa todos tus datos obligatorios (Nombres, Apellidos, Correo y Dirección).');
      return;
    }

    this.procesando = true;

    const payload = {
      nombres: this.cliente.nombres,
      apellidos: this.cliente.apellidos,
      correo: this.cliente.correo,
      telefono: this.cliente.telefono,
      direccion: this.cliente.direccion,
      idTipoPago: Number(this.cliente.idTipoPago),
      montoTotal: this.total,
      
      origenVenta: 'Marketplace',
      idServicio: null,
      
      items: this.itemsCarrito.map(item => ({
        idArticulo: item.idArticulo,
        cantidad: item.cantidad,
        precio: item.precio
      }))
    };

    this.ventaService.checkout(payload).subscribe({
      next: (res: any) => {
        alert(`¡Gracias por tu compra, ${this.cliente.nombres}!\nSe ha generado el comprobante: ${res.nroComprobante}`);
        this.carritoService.vaciarCarrito();
        this.router.navigate(['/']); 
      },
      error: (err) => {
        console.error(err);
        alert('Hubo un error procesando el pago. Intenta de nuevo.');
        this.procesando = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/carrito']);
  }
}