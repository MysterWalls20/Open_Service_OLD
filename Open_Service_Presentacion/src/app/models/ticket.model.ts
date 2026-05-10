export interface Ticket {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  tipoServicio: 'reparacion' | 'mantenimiento';
  descripcion: string;
  direccion: string;
  marca: string;
  modelo: string;
  archivo: string;
  fecha: string;
  estado: 'pendiente' | 'en-proceso' | 'completado' | 'cancelado';
}
