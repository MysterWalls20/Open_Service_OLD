export interface Inventario {
  id: number;
  producto: string;
  sku: string;
  cantidad: number;
  minimo: number;
  ubicacion: string;
  estado: 'ok' | 'bajo';
}
