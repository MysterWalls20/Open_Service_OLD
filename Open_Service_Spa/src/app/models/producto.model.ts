export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  urlImagen?: string;
  estado: 'disponible' | 'agotado';
}
