export interface Venta {
  id: number;
  cliente: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
  metodoPago: string;
}
