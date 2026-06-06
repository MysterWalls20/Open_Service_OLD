import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // IMPORTANTE: Sin el .ts al final

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';

    // 1. Validar que los campos no estén vacíos
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    // 2. Armar el DTO exacto que espera nuestro backend
    const credenciales = {
      correoOUsuario: this.email,
      contrasena: this.password
    };

    // 3. Enviar la petición de Login a SQL Server mediante la API
    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        // Si el backend responde OK, guardamos la sesión con los datos reales
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('admin_user', JSON.stringify({
          email: respuesta.email,
          nombre: respuesta.nombre,
          rol: respuesta.rol
        }));
        
        // Redirigir al panel
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        // Si el backend rechaza el login (contraseña mal, usuario inactivo, etc.)
        this.errorMessage = err.error?.mensaje || 'Credenciales incorrectas';
      }
    });
  }
}