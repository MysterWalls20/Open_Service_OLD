import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categorias-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-page.html',
  styleUrl: './categorias-page.scss',
})
export class CategoriasPageComponent implements OnInit {
  showForm = false;
  editingId: number | null = null;
  categorias: any[] = [];
  loading = false;

  form = {
    nombreCategoria: ''
  };

  
  // --- PAGINACIÓN ---
    currentPage: number = 1;
    itemsPerPage: number = 10;

  constructor(private cdr: ChangeDetectorRef, private categoriaService: CategoriaService) {}

  ngOnInit() {
    this.cargarCategorias();
  }

// --- LÓGICA DE PAGINACIÓN ---
  get categoriasPaginadas() {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    return this.categorias.slice(inicio, inicio + this.itemsPerPage);
  }

  get totalPages() { return Math.max(1, Math.ceil(this.categorias.length / this.itemsPerPage)); }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  // ----------------------------

  cargarCategorias() {
    this.loading = true;
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.currentPage = 1; // Reiniciar
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
    this.form = { nombreCategoria: '' };
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editCategoria(categoria: any) {
    this.editingId = categoria.idCategoria;
    this.form = { nombreCategoria: categoria.nombreCategoria };
    this.showForm = true;
  }

  guardarCategoria() {
    if (!this.form.nombreCategoria.trim()) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }

    if (this.editingId) {
      this.categoriaService.update(this.editingId, this.form).subscribe({
        next: () => {
          this.cargarCategorias();
          this.closeForm();
        },
        error: (err) => alert(err.error?.mensaje || "Error al actualizar la categoría.")
      });
    } else {
      this.categoriaService.create(this.form).subscribe({
        next: () => {
          this.cargarCategorias();
          this.closeForm();
        },
        error: (err) => alert(err.error?.mensaje || "Error al crear la categoría.")
      });
    }
  }

  deleteCategoria(id: number) {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.categoriaService.delete(id).subscribe({
        next: () => this.cargarCategorias(),
        error: (err) => {
          alert(err.error?.mensaje || "No se pudo eliminar. Verifica que no tenga productos asociados.");
        }
      });
    }
  }
}