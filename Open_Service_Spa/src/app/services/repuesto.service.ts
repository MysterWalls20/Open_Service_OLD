import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepuestoService {
  private apiUrl = 'https://localhost:7259/api/Repuestos';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(repuesto: any): Observable<any> {
    return this.http.post(this.apiUrl, repuesto);
  }

  update(id: number, repuesto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, repuesto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
