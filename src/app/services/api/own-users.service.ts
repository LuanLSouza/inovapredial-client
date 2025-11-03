import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OwnUserRequestDTO } from 'src/app/models/own-user.dto';

@Injectable({ providedIn: 'root' })
export class OwnUsersService {
  private readonly baseUrl = `${environment.apiUrl}/ownusers`;

  constructor(private readonly http: HttpClient) {}

  create(dto: OwnUserRequestDTO): Observable<void> {
    return this.http.post<void>(this.baseUrl, dto);
  }
}


