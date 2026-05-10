import { Injectable } from '@angular/core';
import { Reporte } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly STORAGE_KEY = 'reportes_servicio';

  getReportes(): Reporte[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    this.seedData();
    return this.getReportes();
  }

  addReporte(reporte: Omit<Reporte, 'id' | 'fecha'>): Reporte {
    const reportes = this.getReportes();
    const nuevo: Reporte = {
      ...reporte,
      id: Date.now(),
      fecha: new Date().toLocaleDateString('es-PE'),
    };
    reportes.push(nuevo);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reportes));
    return nuevo;
  }

  private seedData(): void {
    const reportes: Reporte[] = [
      { id: 1, ticketId: 1001, descripcion: 'Revisión de refrigerador - Se reemplazó el termostato', tecnico: 'Carlos López', fecha: '15/04/2026', estado: 'completado' },
      { id: 2, ticketId: 1002, descripcion: 'Mantenimiento de aire acondicionado - Limpieza general', tecnico: 'Miguel Rodríguez', fecha: '20/04/2026', estado: 'en-proceso' },
      { id: 3, ticketId: 1003, descripcion: 'Reparación de lavadora - Cambio de bomba de desagüe', tecnico: 'Carlos López', fecha: '25/04/2026', estado: 'completado' },
    ];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reportes));
  }
}
