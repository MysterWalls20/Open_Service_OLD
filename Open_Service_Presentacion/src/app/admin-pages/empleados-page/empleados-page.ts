import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-empleados-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados-page.html',
  styleUrl: './empleados-page.scss',
})
export class EmpleadosPageComponent implements OnInit, OnDestroy {
  showForm = false;
  editingId: number | null = null;
  formModel: any = {};
  empleados: any[] = [];
  roles: any[] = [];
  errorMessage = '';
  loading = false;

  private routerSubscription?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.cargarRoles();
    this.cargarEmpleados();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/empleados') {
          this.cargarEmpleados();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarRoles() {
    this.authService.obtenerRoles().subscribe({
      next: (data: any[]) => this.roles = data,
      error: (err: any) => console.error(err)
    });
  }

  cargarEmpleados() {
    this.loading = true;
    this.authService.obtenerEmpleados().subscribe({
      next: (data: any[]) => {
        this.empleados = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar empleados', err);
        this.loading = false;
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.formModel = { estado: true };
    this.errorMessage = '';
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.formModel = {};
    this.errorMessage = '';
  }

  editEmpleado(empleado: any) {
    this.editingId = empleado.id;
    this.formModel = { ...empleado };

    const rolEncontrado = this.roles.find(r => r.nombre === empleado.rolNombre);
    if (rolEncontrado) this.formModel.idRol = rolEncontrado.id;

    this.showForm = true;
  }

  deleteEmpleado(id: number) {
    if (confirm('¿Estás seguro de desactivar este empleado?')) {
      this.authService.eliminarEmpleado(id).subscribe({
        next: () => {
          alert('Empleado desactivado correctamente');
          this.cargarEmpleados();
        },
        error: (err: any) => alert('Error al eliminar: ' + err.message)
      });
    }
  }

  saveEmpleado() {
    this.errorMessage = '';

    if (this.editingId) {
      const empleadoEditado = {
        id: this.editingId,
        nombres: this.formModel.nombres,
        apellidos: this.formModel.apellidos,
        correo: this.formModel.email,
        idRol: Number(this.formModel.idRol),
        estado: this.formModel.estado
      };

      this.authService.editarEmpleado(empleadoEditado).subscribe({
        next: () => {
          this.closeForm();
          this.cargarEmpleados();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.mensaje || 'Error al editar el empleado';
        }
      });
    } else {
      if (this.formModel.password !== this.formModel.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden. Por favor, verifícalas.';
        return;
      }

      const empleadoDto = {
        nombreUsuario: this.formModel.usuario,
        correo: this.formModel.email,
        contrasena: this.formModel.password,
        nombres: this.formModel.nombres,
        apellidos: this.formModel.apellidos,
        idRol: Number(this.formModel.idRol)
      };

      this.authService.registrarEmpleado(empleadoDto).subscribe({
        next: () => {
          this.closeForm();
          this.cargarEmpleados();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.mensaje || 'Error al conectar con el servidor';
        }
      });
    }
  }
}
