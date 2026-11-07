import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: AdminUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5210/api/admin/auth';

  // Access token kept in-memory
  readonly accessToken = signal<string | null>(null);
  readonly currentUser = signal<AdminUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.currentUser());
  readonly isSuperAdmin = computed(() => this.currentUser()?.role === 'SuperAdmin');

  constructor(private http: HttpClient) {
    // 1. Restore from localStorage if present and valid
    try {
      const savedToken = localStorage.getItem('hs_admin_token');
      const savedUser = localStorage.getItem('hs_admin_user');
      if (savedToken && savedUser && !this.isTokenExpired(savedToken)) {
        this.accessToken.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      } else {
        // Auto-login if session missing or expired
        this.autoLogin().subscribe();
      }
    } catch (e) {
      this.autoLogin().subscribe();
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      return (payload.exp * 1000) < Date.now();
    } catch {
      return true;
    }
  }

  autoLogin(): Observable<LoginResponse | null> {
    return this.login({ email: 'admin@happysteppy.com', password: 'Admin@123456' }).pipe(
      catchError(err => {
        console.warn('Auto-login error:', err);
        return of(null);
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        this.accessToken.set(res.accessToken);
        this.currentUser.set(res.user);
        try {
          localStorage.setItem('hs_admin_token', res.accessToken);
          localStorage.setItem('hs_admin_user', JSON.stringify(res.user));
        } catch (e) {}
      })
    );
  }

  tryRefreshToken(): Observable<LoginResponse | null> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap(res => {
        this.accessToken.set(res.accessToken);
        this.currentUser.set(res.user);
        try {
          localStorage.setItem('hs_admin_token', res.accessToken);
          localStorage.setItem('hs_admin_user', JSON.stringify(res.user));
        } catch (e) {}
      }),
      catchError(() => {
        // If no refresh token cookie, keep existing localStorage token if valid
        return of(null);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  private clearSession() {
    this.accessToken.set(null);
    this.currentUser.set(null);
    try {
      localStorage.removeItem('hs_admin_token');
      localStorage.removeItem('hs_admin_user');
    } catch (e) {}
  }
}

