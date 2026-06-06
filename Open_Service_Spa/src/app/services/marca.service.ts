import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Marca {
  idMarca: number;
  nombreMarca: string;
}

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private apiUrl = 'https://localhost:7259/api/Marcas';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.apiUrl);
  }
}
