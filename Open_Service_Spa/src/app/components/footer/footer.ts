import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  companyName = 'Open Service';
  address = 'Jirón Estete 365, Centro Histórico, Trujillo';
  phone = '940 226 214';
  phoneAlt = '(044) 675 065';
  email = 'contacto@openservice.pe';

  constructor(private router: Router) {}

  irAdministracion() {
    // Revisamos si existe el token de sesión
    const token = localStorage.getItem('token');
    
    if (token) {
      // Si ya está logueado, lo mandamos directo a su panel
      this.router.navigate(['/admin/dashboard']);
    } else {
      // Si no, lo mandamos a que inicie sesión
      this.router.navigate(['/login']);
    }
  }
}