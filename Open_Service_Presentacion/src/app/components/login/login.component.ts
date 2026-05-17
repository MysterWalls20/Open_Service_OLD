import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    if (this.email === 'admin@openservice.com' && this.password === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('admin_user', JSON.stringify({ email: this.email, password: this.password }));
      this.router.navigate(['/admin']);
      return;
    }

    const storedEmpleados = localStorage.getItem('empleados');
    if (storedEmpleados) {
      const empleados = JSON.parse(storedEmpleados);
      const empleado = empleados.find(
        (e: any) => (e.email === this.email || e.usuario === this.email) && e.password === this.password && e.estado
      );
      if (empleado) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('admin_user', JSON.stringify({
          email: empleado.email,
          nombre: `${empleado.nombres} ${empleado.apellidos}`,
          rol: empleado.rolNombre,
        }));
        this.router.navigate(['/admin']);
        return;
      }
    }

    this.errorMessage = 'Credenciales incorrectas';
  }
}