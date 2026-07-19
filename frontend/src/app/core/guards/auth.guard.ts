// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

/**
 * Guardián para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no hay sesión local, intentamos recuperar la sesión con la cookie de refresh
  return authService.refresh().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

/**
 * Guardián para restringir rutas exclusivas de Admin (ej. /settings).
 * Un Viewer autenticado es redirigido al dashboard sin poder ver la pantalla.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guardián para evitar que usuarios logueados accedan a login/register
 */
export const unauthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
