import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private readonly API = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarCEP(cep: string): Observable<ViaCepResponse> {
    const onlyDigits = (cep || '').replace(/\D/g, '');
    return this.http.get<ViaCepResponse>(`${this.API}/${onlyDigits}/json/`).pipe(
      map(res => {
        if ((res as any).erro) {
          throw new Error('CEP não encontrado');
        }
        return res;
      })
    );
  }
}