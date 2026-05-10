export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
}
