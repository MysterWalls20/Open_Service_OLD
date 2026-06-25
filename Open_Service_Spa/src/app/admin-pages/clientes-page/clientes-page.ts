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

  // ==========================================
  // VARIABLES DE PAGINACIÓN (Cópialas al resto)
  // ==========================================
  currentPage: number = 1;
  itemsPerPage: number = 10;

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

  // ==========================================
  // LÓGICA DE PAGINACIÓN (Cópiala al resto)
  // ==========================================
  get clientesPaginados() {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.clientes.slice(inicio, fin);
  }

  get totalPages() {
    // Si no hay clientes, devuelve 1 página por defecto
    return Math.max(1, Math.ceil(this.clientes.length / this.itemsPerPage));
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  // ==========================================

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
        
        // Opcional: Reiniciamos a la página 1 cada vez que cargamos datos nuevos
        this.currentPage = 1; 
        
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