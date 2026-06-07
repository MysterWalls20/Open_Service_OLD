import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-configuraciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuraciones-page.html',
  styleUrl: './configuraciones-page.scss',
})
export class ConfiguracionesPageComponent implements OnInit {
  formModel: any = {};
  adminUser: any = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      this.adminUser = JSON.parse(storedUser);
      const nombreCompleto = (this.adminUser.nombre || '').trim();
      
      // 👇 SEPARADOR INTELIGENTE DE NOMBRES Y APELLIDOS
      const partes = nombreCompleto.split(' ').filter((p: string) => p.length > 0);

      if (partes.length >= 4) {
        // Ej: "Carlos Eduardo Paredes Tapia" -> Nombres: "Carlos Eduardo", Apellidos: "Paredes Tapia"
        this.formModel.nombres = `${partes[0]} ${partes[1]}`;
        this.formModel.apellidos = partes.slice(2).join(' ');
      } else if (partes.length === 3) {
        // Ej: "Carlos Paredes Tapia" -> Nombres: "Carlos", Apellidos: "Paredes Tapia"
        this.formModel.nombres = partes[0];
        this.formModel.apellidos = `${partes[1]} ${partes[2]}`;
      } else if (partes.length === 2) {
        // Ej: "Carlos Paredes" -> Nombres: "Carlos", Apellidos: "Paredes"
        this.formModel.nombres = partes[0];
        this.formModel.apellidos = partes[1];
      } else {
        // Si solo tiene 1 nombre registrado
        this.formModel.nombres = nombreCompleto;
        this.formModel.apellidos = '';
      }
      
      this.formModel.correo = this.adminUser.email || '';
    }
  }

  guardar() {
    this.successMessage = '';
    this.errorMessage = '';
    this.loading = true;

    if (this.formModel.nuevaContrasena && this.formModel.nuevaContrasena !== this.formModel.confirmarContrasena) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden.';
      this.loading = false;
      return;
    }

    const dto: any = {
      nombres: this.formModel.nombres,
      apellidos: this.formModel.apellidos,
      correo: this.formModel.correo,
    };

    // Solo enviamos las contraseñas si el usuario escribió algo
    if (this.formModel.contrasenaActual && this.formModel.nuevaContrasena) {
      dto.contrasenaActual = this.formModel.contrasenaActual;
      dto.nuevaContrasena = this.formModel.nuevaContrasena;
    }

    this.authService.actualizarPerfil(dto).subscribe({
      next: (res: any) => {
        this.successMessage = res.mensaje || 'Perfil actualizado correctamente.';
        this.loading = false;

        // Actualizamos el nombre en el localStorage para que el menú lateral cambie al instante
        const nuevoNombre = `${this.formModel.nombres} ${this.formModel.apellidos}`;
        const updatedUser = {
          ...this.adminUser,
          nombre: nuevoNombre,
          email: this.formModel.correo,
        };
        localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        this.adminUser = updatedUser;

        // Limpiamos las contraseñas por seguridad
        this.formModel.contrasenaActual = '';
        this.formModel.nuevaContrasena = '';
        this.formModel.confirmarContrasena = '';
      },
      error: (err: any) => {
        this.errorMessage = err.error?.mensaje || 'Error al actualizar el perfil.';
        this.loading = false;
      }
    });
  }
}