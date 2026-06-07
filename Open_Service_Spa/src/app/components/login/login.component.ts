import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit { // <-- Implementamos OnInit
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    // Si el usuario intenta entrar a la pantalla de login pero ya tiene un token válido
    const token = localStorage.getItem('token');
    if (token) {
      // Lo pateamos inmediatamente al dashboard, ni siquiera verá el formulario
      this.router.navigate(['/admin/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // ... (Tu código actual de onSubmit se mantiene exactamente igual) ...
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    const credenciales = { correoOUsuario: this.email, contrasena: this.password };

    this.authService.login(credenciales).subscribe({
      next: (respuesta: any) => {
        localStorage.clear();
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('admin_user', JSON.stringify({
          email: respuesta.usuario.correo,
          nombre: respuesta.usuario.nombres,
          rol: respuesta.usuario.rol
        }));
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.mensaje || 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      }
    });
  }
}