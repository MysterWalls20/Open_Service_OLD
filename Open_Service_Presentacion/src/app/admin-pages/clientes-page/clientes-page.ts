import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-page.html',
  styleUrl: './clientes-page.scss',
})
export class ClientesPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;

  clientes: Cliente[] = [];
  loading = false;

  private routerSubscription?: Subscription;

  constructor(private clienteService: ClienteService, private router: Router) {}

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
          nombre: `${c.nombres} ${c.apellidos}`,
          email: c.correo,
          telefono: c.telefono,
          direccion: c.direccion,
          estado: 'activo' as const
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.loading = false;
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  editCliente(cliente: Cliente) {
    this.editingId = cliente.id;
    this.showForm = true;
  }

  deleteCliente(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clienteService.delete(id).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => console.error('Error al eliminar cliente', err)
      });
    }
  }
}
