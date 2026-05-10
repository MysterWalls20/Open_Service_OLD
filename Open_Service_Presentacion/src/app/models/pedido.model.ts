export interface Pedido {
  id: number;
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado: 'pendiente' | 'en-proceso' | 'completado' | 'cancelado';
}
