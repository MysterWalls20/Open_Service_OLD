import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Definimos la estructura exacta de lo que guardaremos en el carrito
export interface ItemCarrito {
  idArticulo: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  stockMaximo: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: ItemCarrito[] = [];
  
  // BehaviorSubject permite que cualquier componente (como un contador en tu Navbar)
  // se entere en tiempo real de cuántos productos hay en el carrito
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  constructor() {
    // Cuando el servicio arranca, buscamos si el cliente dejó cosas en el carrito ayer
    const carritoGuardado = localStorage.getItem('mi_carrito_open_service');
    if (carritoGuardado) {
      this.items = JSON.parse(carritoGuardado);
      this.carritoSubject.next(this.items);
    }
  }

  agregarAlCarrito(nuevoItem: ItemCarrito) {
    const itemExistente = this.items.find(i => i.idArticulo === nuevoItem.idArticulo);

    if (itemExistente) {
      // Si el producto ya está en el carrito, solo le sumamos +1 a la cantidad
      if (itemExistente.cantidad + nuevoItem.cantidad > nuevoItem.stockMaximo) {
        alert('No puedes agregar más. Has alcanzado el límite de stock disponible de este producto.');
        return;
      }
      itemExistente.cantidad += nuevoItem.cantidad;
    } else {
      // Si es un producto nuevo, lo metemos a la lista
      this.items.push(nuevoItem);
    }

    this.sincronizarStorage();
    alert(`¡Agregado exitosamente: ${nuevoItem.nombre}!`);
  }

  eliminarDelCarrito(idArticulo: number) {
    // Filtramos la lista para quitar el producto que el usuario eliminó
    this.items = this.items.filter(i => i.idArticulo !== idArticulo);
    this.sincronizarStorage();
  }

  vaciarCarrito() {
    this.items = [];
    this.sincronizarStorage();
  }

  obtenerTotal(): number {
    // Multiplica el precio por la cantidad de cada item y lo suma todo
    return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  private sincronizarStorage() {
    // Guarda la lista actualizada en la memoria del navegador
    localStorage.setItem('mi_carrito_open_service', JSON.stringify(this.items));
    // Avisa a todos los componentes que el carrito se actualizó
    this.carritoSubject.next(this.items);
  }
}