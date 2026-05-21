import { Component, OnInit } from '@angular/core';
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
      },
      error: (err) => {
        console.error('Error al cargar compras', err);
        this.loading = false;
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
    if (!this.nuevoDetalle.idArticulo || !this.nuevoDetalle.cantidad || !this.nuevoDetalle.precio) {
      alert("Por favor completa el producto, cantidad y precio.");
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
    this.nuevoDetalle = { idArticulo: '' }; 
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
    if (this.detallesCompra.length === 0) {
      alert("Debes agregar al menos un producto a la compra.");
      return;
    }

    if (!this.formModel.idProveedor) {
      alert("Por favor selecciona un proveedor.");
      return;
    }

    const compraDto = {
      idProveedor: Number(this.formModel.idProveedor),
      nroFacturaProveedor: this.formModel.nroFactura,
      fechaCompra: this.formModel.fechaCompra,
      detalles: this.detallesCompra
    };

    this.compraService.create(compraDto).subscribe({
      next: () => {
        this.closeForm();
        this.cargarCompras();
        this.cargarArticulos(); 
        alert("¡Compra guardada y stock actualizado!");
      },
      error: (err) => alert("Error al guardar: " + (err.error?.mensaje || "Error del servidor"))
    });
  }
}