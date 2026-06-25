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
  
  pedidoOriginal: any = null; 

  form = {
    nombres: '', apellidos: '', correo: '', telefono: '', direccion: '',
    electrodomestico: '', nombreMarca: '', modelo: '', descripcion: '', tipoServicio: 'Reparacion', estado: 'Pendiente'
  };

  // --- PAGINACIÓN ---
  currentPage: number = 1;
  itemsPerPage: number = 10;

  get pedidosPaginados() {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    return this.pedidos.slice(inicio, inicio + this.itemsPerPage);
  }

  get totalPages() { return Math.max(1, Math.ceil(this.pedidos.length / this.itemsPerPage)); }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  // ------------------

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
          
          estadoClase: this.getEstadoClass(p.estado), // La clase CSS segura (sin espacios)
          estadoLabel: this.capitalizarPrimeraLetra(p.estado || 'Pendiente'), // El texto bonito para el usuario
          
          estadoReal: p.estado || 'Pendiente'
        }));
        this.currentPage = 1;
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

  // ... (Tus métodos openForm, closeForm, editPedido, guardarPedido, deletePedido se mantienen EXACTAMENTE igual) ...
  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.pedidoOriginal = null;
    this.form = { nombres: '', apellidos: '', correo: '', telefono: '', direccion: '', electrodomestico: '', nombreMarca: '', modelo: '', descripcion: '', tipoServicio: 'Reparacion', estado: 'Pendiente' };
  }

  closeForm() { this.showForm = false; }

  editPedido(pedido: any) {
    this.editingId = pedido.idPedido;
    this.pedidoOriginal = pedido; 
    this.showForm = true;
    
    this.form = {
      nombres: pedido.idClienteNavigation?.nombres || '', apellidos: pedido.idClienteNavigation?.apellidos || '', correo: pedido.idClienteNavigation?.correo || '', telefono: pedido.idClienteNavigation?.telefono || '', direccion: pedido.idClienteNavigation?.direccion || '', electrodomestico: pedido.electrodomestico, nombreMarca: pedido.idMarcaNavigation?.nombreMarca || '', modelo: pedido.modelo, descripcion: pedido.descripcion, tipoServicio: pedido.tipoDeServicio,
      estado: pedido.estadoReal || 'Pendiente' 
    };
  }

  guardarPedido() {
    if (this.editingId) {
      const updateData = { electrodomestico: this.form.electrodomestico, modelo: this.form.modelo, descripcion: this.form.descripcion };
      this.pedidoService.update(this.editingId, updateData).subscribe({
        next: () => { this.cargarPedidos(); this.closeForm(); },
        error: (err) => {
          const msg = err.error?.mensaje || err.error?.title || "Error de validación desconocido.";
          alert(`NO SE PUDO ACTUALIZAR:\n${msg}`);
        }
      });
    } else {
      this.pedidoService.createPedidoPublico(this.form).subscribe({
        next: () => { this.cargarPedidos(); this.closeForm(); },
        error: (err) => {
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
        error: (err) => { alert("No se pudo eliminar el pedido. Revisa la consola."); }
      });
    }
  }

  getEstadoClass(estado: string): string {
    const est = (estado || '').toLowerCase().trim();
    if (est === 'en proceso') return 'en-proceso'; 
    if (est === 'anulado' || est === 'cancelado') return 'cancelado'; 
    if (est === 'completado') return 'completado';
    return 'pendiente';
  }

  capitalizarPrimeraLetra(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }
}