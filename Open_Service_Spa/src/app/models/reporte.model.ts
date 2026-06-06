export interface Reporte {
  id: number;
  ticketId: number;
  descripcion: string;
  tecnico: string;
  fecha: string;
  estado: 'pendiente' | 'en-proceso' | 'completado' | 'cancelado';
}

export interface ReporteResumen {
  titulo: string;
  valor: string;
  cambio: string;
  positivo: boolean;
}
