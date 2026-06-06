import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../services/proveedor.service';

@Component({
  selector: 'app-proveedor-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor-page.html',
  styleUrl: './proveedor-page.scss',
})
export class ProveedorPageComponent implements OnInit {
  showForm = false;
  editingId: number | null = null;
  formModel: any = {};
  proveedores: any[] = [];
  loading = false;

  constructor(private cdr: ChangeDetectorRef, private proveedorService: ProveedorService) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.loading = true;
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
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

  editProveedor(p: any) {
    this.editingId = p.idProveedor;
    this.formModel = { ...p };
    this.showForm = true;
  }

  deleteProveedor(id: number) {
    if (confirm('¿Eliminar?')) {
      this.proveedorService.delete(id).subscribe(() => this.cargarProveedores());
    }
  }

  saveProveedor() {
    if (this.editingId) {
      this.proveedorService.update(this.editingId, this.formModel).subscribe(() => {
        this.closeForm();
        this.cargarProveedores();
      });
    } else {
      this.proveedorService.create(this.formModel).subscribe(() => {
        this.closeForm();
        this.cargarProveedores();
      });
    }
  }
}