import { Component, OnInit } from '@angular/core';
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

  constructor(private inventarioService: InventarioService) {}

  ngOnInit() {
    this.cargarArticulos();
  }

  cargarArticulos() {
    this.inventarioService.getAll().subscribe(data => this.articulos = data);
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