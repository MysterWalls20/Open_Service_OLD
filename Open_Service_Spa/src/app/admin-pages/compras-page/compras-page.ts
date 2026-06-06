import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../services/compra.service';
import { InventarioService } from '../../services/inventario.service';
import { ProveedorService } from '../../services/proveedor.service';

@Component({
  selector: 'app-compras-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras-page.html',
  styleUrl: './compras-page.scss',
})
export class ComprasPageComponent implements OnInit {
  showForm = false;
  loading = false;
  
  // Listas de datos
  compras: any[] = [];
  articulos: any[] = []; 
  proveedores: any[] = []; 
  
  // Modelos del formulario
  formModel: any = { idProveedor: '' }; 
  detallesCompra: any[] = [];
  nuevoDetalle: any = { idArticulo: '' };
  totalCompraCalculado: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private compraService: CompraService, 
    private inventarioService: InventarioService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit() {
    this.cargarCompras();
    this.cargarArticulos();
    this.cargarProveedores(); 
  }

  cargarCompras() {
    this.loading = true;
    this.compraService.getAll().subscribe({
      next: (data) => {
        this.compras = data.map((c: any) => ({
          id: c.idCompra,
          idProveedor: c.idProveedor,
          nroFactura: c.nroFacturaProveedor,
          fechaCompra: c.fechaCompra ? new Date(c.fechaCompra).toLocaleDateString() : 'N/A',
          total: c.totalCompra
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar compras', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarArticulos() {
    this.inventarioService.getAll().subscribe(data => this.articulos = data);
  }

  cargarProveedores() {
    this.proveedorService.getAll().subscribe(data => this.proveedores = data);
  }

  obtenerNombreProveedor(id: number): string {
    const prov = this.proveedores.find(p => p.idProveedor == id);
    return prov ? prov.razonSocial : 'Cargando...';
  }

  openForm() {
    this.showForm = true;
    this.formModel = { idProveedor: '' }; 
    this.detallesCompra = [];
    this.nuevoDetalle = { idArticulo: '' };
    this.totalCompraCalculado = 0;
  }

  closeForm() {
    this.showForm = false;
  }

agregarDetalle() {
    // 1. Validar que se haya seleccionado un artículo
    if (!this.nuevoDetalle.idArticulo) {
      alert("Por favor selecciona un artículo del inventario.");
      return;
    }

    // 2. Validar cantidad lógica
    if (!this.nuevoDetalle.cantidad || this.nuevoDetalle.cantidad <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    // 3. Validar precio lógico
    if (!this.nuevoDetalle.precio || this.nuevoDetalle.precio <= 0) {
      alert("El precio unitario de compra debe ser mayor a 0.");
      return;
    }

    const articulo = this.articulos.find(a => a.idArticulo == this.nuevoDetalle.idArticulo);
    const subtotal = this.nuevoDetalle.cantidad * this.nuevoDetalle.precio;

    this.detallesCompra.push({
      idArticulo: Number(this.nuevoDetalle.idArticulo),
      nombreArticulo: articulo?.nombre || 'Desconocido',
      cantidad: Number(this.nuevoDetalle.cantidad),
      precioUnitarioCompra: Number(this.nuevoDetalle.precio),
      subtotal: subtotal
    });

    this.calcularTotal();
    this.nuevoDetalle = { idArticulo: '', cantidad: null, precio: null }; 
  }

  eliminarDetalle(index: number) {
    this.detallesCompra.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalCompraCalculado = this.detallesCompra.reduce((acc, curr) => acc + curr.subtotal, 0);
  }

  deleteCompra(id: number) {
    if (confirm('¿Eliminar esta compra?')) {
      this.compraService.delete(id).subscribe(() => this.cargarCompras());
    }
  }

  saveCompra() {
  // ==========================================
    // VALIDACIONES DE SEGURIDAD FRONTEND
    // ==========================================

    // 1. Validar Proveedor
    if (!this.formModel.idProveedor) {
      alert("Falta información: Por favor selecciona un proveedor.");
      return;
    }

    // 2. Validar Número de Factura
    if (!this.formModel.nroFactura || this.formModel.nroFactura.trim() === '') {
      alert("Falta información: Ingresa el número de factura del proveedor.");
      return;
    }

    // 3. Validar Fecha
    if (!this.formModel.fechaCompra) {
      alert("Falta información: Selecciona la fecha en la que se realizó la compra.");
      return;
    }

    // 4. Validar Lista de Productos (No se puede guardar una factura vacía)
    if (this.detallesCompra.length === 0) {
      alert("Error: Debes agregar al menos un producto a la lista de compra.");
      return;
    }

    // ==========================================
    // SI PASA LAS VALIDACIONES, ENVIAMOS A C#
    // ==========================================
    const compraDto = {
      idProveedor: Number(this.formModel.idProveedor),
      nroFacturaProveedor: this.formModel.nroFactura.trim(),
      fechaCompra: this.formModel.fechaCompra,
      detalles: this.detallesCompra
    };

    this.compraService.create(compraDto).subscribe({
      next: () => {
        this.closeForm();
        this.cargarCompras();
        this.cargarArticulos(); // Recargamos para ver el nuevo stock
        alert("¡Compra guardada y stock de inventario actualizado correctamente!");
      },
      error: (err) => alert("Error al guardar: " + (err.error?.mensaje || "Error del servidor"))
    });
  }
}