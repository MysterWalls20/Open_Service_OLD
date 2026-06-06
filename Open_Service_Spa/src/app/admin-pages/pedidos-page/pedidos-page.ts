import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-page.html',
  styleUrl: './pedidos-page.scss',
})
export class PedidosPageComponent implements OnInit {
  showForm = false;
  editingId: number | null = null;
  pedidos: any[] = [];
  loading = false;
  
  // NUEVA VARIABLE: Guarda toda la información original del pedido de la BD
  pedidoOriginal: any = null; 

  form = {
    nombres: '', apellidos: '', correo: '', telefono: '', direccion: '',
    electrodomestico: '', nombreMarca: '', modelo: '', descripcion: '', tipoServicio: 'Reparacion', estado: 'Pendiente'
  };

  constructor(private cdr: ChangeDetectorRef, private pedidoService: PedidoService) { }

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;
    this.pedidoService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data.map(p => ({
          ...p,
          id: p.idPedido,
          ticketFormat: `TK-${p.idPedido.toString().padStart(5, '0')}`,
          cliente: p.idClienteNavigation ? `${p.idClienteNavigation.nombres} ${p.idClienteNavigation.apellidos}` : 'N/A',
          producto: p.electrodomestico,
          fecha: p.fechaSolicitud ? new Date(p.fechaSolicitud).toLocaleDateString('es-PE') : 'N/A',
          estado: p.estado ? p.estado.toLowerCase() : 'pendiente',
          estadoReal: p.estado || 'Pendiente'
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.pedidoOriginal = null;
    this.form = { nombres: '', apellidos: '', correo: '', telefono: '', direccion: '', electrodomestico: '', nombreMarca: '', modelo: '', descripcion: '', tipoServicio: 'Reparacion', estado: 'Pendiente' };
  }

  closeForm() {
    this.showForm = false;
  }

  editPedido(pedido: any) {
    this.editingId = pedido.idPedido;
    this.pedidoOriginal = pedido; // Guardamos todo el objeto completo (con IdCliente, IdMarca, etc.)
    this.showForm = true;
    
    this.form = {
      nombres: pedido.idClienteNavigation?.nombres || '',
      apellidos: pedido.idClienteNavigation?.apellidos || '',
      correo: pedido.idClienteNavigation?.correo || '',
      telefono: pedido.idClienteNavigation?.telefono || '',
      direccion: pedido.idClienteNavigation?.direccion || '',
      electrodomestico: pedido.electrodomestico,
      nombreMarca: pedido.idMarcaNavigation?.nombreMarca || '',
      modelo: pedido.modelo,
      descripcion: pedido.descripcion,
      tipoServicio: pedido.tipoDeServicio,
      estado: pedido.estadoReal || 'Pendiente' // Usamos el estadoReal para que coincida con las opciones
    };
  }

  guardarPedido() {
    if (this.editingId) {
      // ENVIAMOS UN PAQUETE LIMPIO: Solo la info técnica. Nada de clientes, ni marcas, ni estados.
      const updateData = {
        electrodomestico: this.form.electrodomestico,
        modelo: this.form.modelo,
        descripcion: this.form.descripcion
      };

      this.pedidoService.update(this.editingId, updateData).subscribe({
        next: () => {
          this.cargarPedidos();
          this.closeForm();
        },
        error: (err) => {
          console.error("Fallo al actualizar:", err);
          // Leemos el error exacto que envía .NET
          const msg = err.error?.mensaje || err.error?.title || "Error de validación desconocido.";
          alert(`NO SE PUDO ACTUALIZAR:\n${msg}`);
        }
      });
    } else {
      // Crear pedido manual
      this.pedidoService.createPedidoPublico(this.form).subscribe({
        next: () => {
          this.cargarPedidos();
          this.closeForm();
        },
        error: (err) => {
          console.error("Fallo al crear:", err);
          const msg = err.error?.mensaje || "Error desconocido.";
          alert(`NO SE PUDO CREAR:\n${msg}`);
        }
      });
    }
  }

  deletePedido(id: number) {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
      this.pedidoService.delete(id).subscribe({
        next: () => this.cargarPedidos(),
        error: (err) => {
          console.error("Fallo al eliminar:", err);
          alert("No se pudo eliminar el pedido. Revisa la consola.");
        }
      });
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente', 'en-proceso': 'En Proceso',
      'completado': 'Completado', 'cancelado': 'Cancelado', 'nuevo': 'Pendiente'
    };
    return labels[estado] || estado;
  }
}