// TODO: Implementar componente de "Olvidé mi contraseña"
// Aquí irá la lógica para solicitar y verificar el código de recuperación

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  // TODO: Definir propiedades (email, codigo, nuevaContrasena, etc.)

  constructor(private router: Router) {}

  // TODO: Implementar método para solicitar código
  solicitarCodigo() {
    // Implementar aquí
  }

  // TODO: Implementar método para resetear contraseña
  resetearPassword() {
    // Implementar aquí
  }
}
