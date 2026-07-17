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
  preferences?: {
    nyanCatMode: boolean;
  };
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

  constructor() {
    // Rehidratar sesión local al inicializar el servicio (Angular app startup)
    try {
      const storedToken = localStorage.getItem('azkin_token');
      const storedUser = localStorage.getItem('azkin_user');
      if (storedToken && storedUser) {
        this.accessToken = storedToken;
        this.currentUser.set(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('[Auth] Error al restaurar la sesión local:', e);
    }
  }

  /**
   * Retorna el token de acceso en memoria
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Registra un nuevo administrador en el sistema
   */
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }

  /**
   * Inicia sesión y almacena el payload del token decodificado en memoria y localStorage
   */
  login(identifier: string, password: string, isTvSessionEnabled = false): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { identifier, password, isTvSessionEnabled }).pipe(
      tap(res => {
        if (res && res.user) {
          // Soporta el mapeo tanto de res.accessToken (spec) como de res.token (implementación)
          this.accessToken = res.accessToken || res.token;
          this.currentUser.set(res.user);
          
          // Persistencia para rehidratar sesión
          localStorage.setItem('azkin_token', this.accessToken ?? '');
          localStorage.setItem('azkin_user', JSON.stringify(res.user));
        }
      })
    );
  }

  /**
   * Intenta refrescar el token de acceso localmente si ya existe sesión válida
   */
  refresh(): Observable<any> {
    const token = this.accessToken;
    const user = this.currentUser();
    if (token && user) {
      return of({ token, user });
    }
    
    // Si no hay datos, limpiamos y arrojamos error
    this.accessToken = null;
    this.currentUser.set(null);
    localStorage.removeItem('azkin_token');
    localStorage.removeItem('azkin_user');
    return throwError(() => new Error('Sesión no encontrada'));
  }

  /**
   * Cierra la sesión activa limpiando el estado reactivo del cliente y localStorage
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearLocalSession();
      }),
      catchError(err => {
        this.clearLocalSession();
        return of(null);
      })
    );
  }

  private clearLocalSession(): void {
    this.accessToken = null;
    this.currentUser.set(null);
    localStorage.removeItem('azkin_token');
    localStorage.removeItem('azkin_user');
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
