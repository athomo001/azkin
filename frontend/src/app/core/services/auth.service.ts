// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';

// Interfaz para el usuario autenticado
export interface UserPayload {
  userId: string;
  email?: string;
  username?: string;
  role: string;
  adminId?: string;
  permissions?: string[];
  isTvSessionEnabled?: boolean;
  preferences?: {
    nyanCatMode: boolean;
  };
}

/** Respuesta de /login, /register y /refresh. El refresh token viaja solo como cookie HttpOnly. */
export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user: UserPayload;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/auth';

  private accessToken: string | null = null;

  // Signal para almacenar los datos del usuario en sesión
  readonly currentUser = signal<UserPayload | null>(null);

  // Computed signal para saber de forma reactiva si el usuario está autenticado
  readonly isAuthenticated = computed(() => !!this.currentUser());

  // Computed signal para validar si el rol actual es Administrador
  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role?.toLowerCase();
    return role === 'admin';
  });

  /**
   * Retorna el token de acceso en memoria
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Registra un nuevo administrador en el sistema
   */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password });
  }

  /**
   * Consulta si el registro público sigue habilitado (solo lo está hasta que exista el primer admin).
   */
  getBootstrapStatus(): Observable<{ canRegister: boolean }> {
    return this.http.get<{ canRegister: boolean }>(`${this.apiUrl}/bootstrap-status`);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  /**
   * Inicia sesión. El access token vive solo en memoria (nunca en localStorage);
   * el backend persiste el refresh token como cookie HttpOnly, inaccesible a JS.
   */
  login(identifier: string, password: string, isTvSessionEnabled = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { identifier, password, isTvSessionEnabled }).pipe(
      tap(res => {
        if (res && res.user) {
          this.accessToken = res.accessToken || res.token || null;
          this.currentUser.set(res.user);
        }
      })
    );
  }

  /**
   * Renueva la sesión llamando al backend, que lee la cookie HttpOnly de refresh.
   * Usado al arrancar la app (rehidratación tras recargar la página) y ante un 401 en el interceptor.
   */
  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap(res => {
        if (res && res.user) {
          this.accessToken = res.accessToken || res.token || null;
          this.currentUser.set(res.user);
        }
      }),
      catchError(err => {
        this.clearLocalSession();
        return throwError(() => err);
      })
    );
  }

  /**
   * Cierra la sesión: limpia el estado reactivo en memoria y pide al backend que borre la cookie de refresh.
   */
  logout(): Observable<{ message: string } | null> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearLocalSession()),
      catchError(() => {
        this.clearLocalSession();
        return of(null);
      })
    );
  }

  private clearLocalSession(): void {
    this.accessToken = null;
    this.currentUser.set(null);
  }

  /**
   * Valida si el usuario cuenta con un permiso específico (para Viewers)
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const role = user.role?.toLowerCase();
    if (role === 'admin') return true; // Admins tienen acceso total
    return user.permissions?.includes(permission) || user.permissions?.includes('all') || false;
  }
}
