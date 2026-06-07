import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// Importa tu AuthService si ya tienes listos los endpoints en C#
// import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  // Control de flujo
  paso = 1; // 1: Solicitar correo | 2: Ingresar código y nueva contraseña
  isLoading = false;
  showPassword = false;

  // Variables del formulario
  email = '';
  codigo = '';
  nuevaPassword = '';
  confirmarPassword = '';

  // Mensajes de feedback
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}
  // Si usas el servicio, agrégalo al constructor: 
  // constructor(private router: Router, private authService: AuthService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  solicitarCodigo() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    this.isLoading = true;

    // TODO: Reemplazar este setTimeout por la llamada real a tu API en C#
    // this.authService.solicitarRecuperacion(this.email).subscribe(...)
    setTimeout(() => {
      this.isLoading = false;
      this.paso = 2; // Pasamos a la siguiente pantalla
      this.successMessage = 'Se ha enviado un código de seguridad a tu correo.';
    }, 1500);
  }

  resetearPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.codigo || !this.nuevaPassword || !this.confirmarPassword) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;

    // TODO: Reemplazar este setTimeout por la llamada real a tu API en C#
    // this.authService.cambiarPassword(this.email, this.codigo, this.nuevaPassword).subscribe(...)
    setTimeout(() => {
      this.isLoading = false;
      alert('¡Tu contraseña ha sido actualizada exitosamente! Ya puedes iniciar sesión.');
      this.router.navigate(['/login']);
    }, 1500);
  }
}