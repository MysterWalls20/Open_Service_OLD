import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-page.html',
  styleUrl: './clientes-page.scss',
})
export class ClientesPageComponent implements OnInit, OnDestroy {
  showForm = false;
  clientes: any[] = [];
  loading = false;

  form = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: ''
  };

  private routerSubscription?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef, 
    private clienteService: ClienteService, 
    private router: Router
  ) {}

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
    this.form = { nombres: '', apellidos: '', correo: '', telefono: '', direccion: '' };
  }

  closeForm() {
    this.showForm = false;
  }

  guardarCliente() {
    if (!this.form.nombres || !this.form.apellidos || !this.form.correo) {
      alert("Nombres, Apellidos y Correo son obligatorios.");
      return;
    }

    this.clienteService.create(this.form).subscribe({
      next: () => {
        this.cargarClientes();
        this.closeForm();
        alert("Cliente registrado exitosamente.");
      },
      error: (err) => alert(err.error?.mensaje || "Error al crear el cliente.")
    });
  }
}