import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Empleado } from '../../models/empleado.model';
import { AuthService } from '../../services/auth.service.ts';

@Component({
  selector: 'app-empleados-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados-page.html',
  styleUrl: './empleados-page.scss',
})
export class EmpleadosPageComponent implements OnInit {
  showForm = false;
  editingId: number | null = null;
  formModel: any = {}; 
  empleados: any[] = [];
  roles: any[] = [];
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.cargarRoles();
    this.cargarEmpleados();
  }

  cargarRoles() {
    this.authService.obtenerRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error(err)
    });
  }

  cargarEmpleados() {
    this.authService.obtenerEmpleados().subscribe({
      next: (data) => this.empleados = data,
      error: (err) => console.error('Error al cargar empleados', err)
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
        error: (err) => alert('Error al eliminar: ' + err.message)
      });
    }
  }

  saveEmpleado() {
    this.errorMessage = '';

    if (this.editingId) {
      alert("La edición completa la conectaremos en el siguiente paso. ¡Pero ya lista y elimina!");
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
        error: (err) => {
          this.errorMessage = err.error?.mensaje || 'Error al conectar con el servidor';
        }
      });
    }
  }
}