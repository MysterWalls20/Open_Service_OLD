import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly apiUrl = 'https://localhost:7259/api/Pedidos';
  // Ruta hacia tu controlador de marcas
  private readonly marcasUrl = 'https://localhost:7259/api/Marcas';

  constructor(private http: HttpClient) { }

  // --- Métodos de Pedidos ---
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPedidosByEmail(correo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/email`, { params: { correo } });
  }

  createPedidoPublico(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ticket-publico`, formData);
  }

  update(id: number, pedido: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, pedido);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // --- NUEVO MÉTODO: Trae las marcas dinámicas de SQL Server ---
  getMarcas(): Observable<any[]> {
    return this.http.get<any[]>(this.marcasUrl);
  }
}