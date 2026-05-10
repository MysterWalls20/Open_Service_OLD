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

    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === this.email && user.password === this.password) {
        localStorage.setItem('isLoggedIn', 'true');
        this.router.navigate(['/admin']);
        return;
      }
    }

    if (this.email === 'admin@openservice.com' && this.password === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('admin_user', JSON.stringify({ email: this.email, password: this.password }));
      this.router.navigate(['/admin']);
    } else {
      this.errorMessage = 'Credenciales incorrectas';
    }
  }
}