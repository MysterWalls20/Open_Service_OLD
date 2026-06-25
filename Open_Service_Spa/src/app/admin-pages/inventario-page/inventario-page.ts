import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-page.html',
  styleUrl: './inventario-page.scss',
})
export class InventarioPageComponent implements OnInit {
  showForm = false;
  editingId: number | null = null;
  formModel: any = {};
  articulos: any[] = [];
  loading = false;

  // --- PAGINACIÓN ---
  currentPage: number = 1;
  itemsPerPage: number = 10;

  get articulosPaginados() {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    return this.articulos.slice(inicio, inicio + this.itemsPerPage);
  }

  get totalPages() { return Math.max(1, Math.ceil(this.articulos.length / this.itemsPerPage)); }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  // ------------------

  constructor(private cdr: ChangeDetectorRef, private inventarioService: InventarioService) {}

  ngOnInit() {
    this.cargarArticulos();
  }

  cargarArticulos() {
    this.loading = true;
    this.inventarioService.getAll().subscribe({
      next: (data) => {
        this.articulos = data;
        this.currentPage = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar artículos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.formModel = {};
  }

  closeForm() {
    this.showForm = false;
  }

  editArticulo(a: any) {
    this.editingId = a.idArticulo;
    this.formModel = { ...a };
    this.showForm = true;
  }

  deleteArticulo(id: number) {
    if (confirm('¿Eliminar?')) {
      this.inventarioService.delete(id).subscribe(() => this.cargarArticulos());
    }
  }

  saveArticulo() {
    if (this.editingId) {
      this.inventarioService.update(this.editingId, this.formModel).subscribe(() => {
        this.closeForm();
        this.cargarArticulos();
      });
    } else {
      this.inventarioService.create(this.formModel).subscribe(() => {
        this.closeForm();
        this.cargarArticulos();
      });
    }
  }
}