import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ATENCIÓN: Cambia el puerto '7035' por el puerto real que te dio Visual Studio (Swagger)
  private apiUrl = 'https://localhost:7259/api/Auth'; 

  constructor(private http: HttpClient) { }

  registrarEmpleado(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar-empleado`, dto);
  }

  // Preparando el terreno para cuando hagamos el endpoint de Login en .NET
  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }
  obtenerRoles(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }
  
  obtenerEmpleados(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/empleados`);
  }

  eliminarEmpleado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/empleado/${id}`);
  }

  editarEmpleado(dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/empleado`, dto);
  }


}