import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './servicios-page.html',
  styleUrl: './servicios-page.scss',
})
export class ServiciosPageComponent {
  // Al ser una página de presentación pública, ya no necesitamos 
  // inyectar servicios ni buscar en la base de datos aquí.
}