import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserInfo } from '../models/userinfo.interface';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_INFO_KEY = 'user_info';
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();

  private userInfoSubject = new BehaviorSubject<UserInfo>(this.getUserInfo());
  public userInfo$ = this.userInfoSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeToken(response.token);
          const mappedRole = this.mapRole(response.role);
          const userInfo: UserInfo = {
            name: response.username || '',
            role: mappedRole,
            building: ''
          };
          this.setUserInfo(userInfo);
          this.userInfoSubject.next(userInfo);
          localStorage.setItem('last_login', new Date().toISOString());
          this.tokenSubject.next(response.token);
        })
      );
  }
  
  logout(): void {
    this.removeToken();
    this.clearUserData();
    this.tokenSubject.next(null);
  }

  private clearUserData(): void {
    // Limpar dados do usuário armazenados localmente
    localStorage.removeItem('user_info');
    localStorage.removeItem('building_info');
    localStorage.removeItem('user_preferences');
    localStorage.removeItem('last_login');
    // Adicione outros dados que precisem ser limpos
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token && !this.isTokenExpired(token);
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Método para criar headers com token para requisições autenticadas
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // UserInfo helpers
  private mapRole(apiRole: 'ADMIN' | 'USER'): string {
    if (apiRole === 'ADMIN') return 'Sindico';
    return 'Morador';
  }

  setUserInfo(info: UserInfo): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(info));
    this.userInfoSubject.next(info);
  }

  getUserInfo(): UserInfo {
    const raw = localStorage.getItem(this.USER_INFO_KEY);
    if (!raw) {
      return { name: '', role: '', building: '' };
    }
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      return { name: '', role: '', building: '' };
    }
  }
}
