import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss',
})
export class AdminHeaderComponent implements OnInit {
  currentTime = '';
  panelTitle = 'Panel de..'; // Título por defecto

  constructor() {
    this.updateTime();
    setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnInit() {
    // Leemos los datos del usuario logueado
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // Si el usuario tiene un rol, actualizamos el título dinámicamente
      if (user.rol) {
        this.panelTitle = `Panel de ${user.rol}`; 
        // Ejemplo: "Panel de Técnico", "Panel de Vendedor", etc.
      }
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}