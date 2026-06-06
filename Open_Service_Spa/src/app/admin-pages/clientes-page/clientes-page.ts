import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- AGREGADO AQUI
  templateUrl: './clientes-page.html',
  styleUrl: './clientes-page.scss',
})
export class ClientesPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;
  clientes: any[] = [];
  loading = false;

  // Objeto para atrapar los datos del HTML
  form = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: ''
  };

  private routerSubscription?: Subscription;

  constructor(private cdr: ChangeDetectorRef, private clienteService: ClienteService, private router: Router) {}

  ngOnInit() {
    this.cargarClientes();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/clientes') {
          this.cargarClientes();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

cargarClientes() {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data.map((c: any) => ({
          id: c.idCliente,
          nombres: c.nombres,
          apellidos: c.apellidos,
          // 👇 CAMBIAMOS ESTA LÍNEA PARA QUE EL HTML LA LEA DIRECTAMENTE
          nombre: `${c.nombres} ${c.apellidos}`, 
          email: c.correo,
          telefono: c.telefono,
          direccion: c.direccion,
          estado: 'activo'
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.form = { nombres: '', apellidos: '', correo: '', telefono: '', direccion: '' };
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editCliente(cliente: any) {
    this.editingId = cliente.id;
    // Llenamos el formulario con los datos exactos
    this.form = {
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      correo: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion
    };
    this.showForm = true;
  }

  guardarCliente() {
    if (!this.form.nombres || !this.form.apellidos || !this.form.correo) {
      alert("Nombres, Apellidos y Correo son obligatorios.");
      return;
    }

    if (this.editingId) {
      this.clienteService.update(this.editingId, this.form).subscribe({
        next: () => {
          this.cargarClientes();
          this.closeForm();
        },
        error: (err) => alert(err.error?.mensaje || "Error al actualizar el cliente.")
      });
    } else {
      this.clienteService.create(this.form).subscribe({
        next: () => {
          this.cargarClientes();
          this.closeForm();
        },
        error: (err) => alert(err.error?.mensaje || "Error al crear el cliente.")
      });
    }
  }

  deleteCliente(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clienteService.delete(id).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => {
          // Atrapamos el error de llave foránea que manda C#
          alert(err.error?.mensaje || "No se pudo eliminar el cliente.");
        }
      });
    }
  }
}