import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
}