export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: string;
  estado: 'activo' | 'inactivo';
}
