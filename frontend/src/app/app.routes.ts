// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Routes } from '@angular/router';
import { authGuard, unauthGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta raíz redirige según el estado de sesión
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Rutas públicas (solo accesibles sin sesión activa)
  {
    path: 'login',
    canActivate: [unauthGuard],
    loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [unauthGuard],
    loadComponent: () => import('./features/auth/register').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [unauthGuard],
    loadComponent: () => import('./features/auth/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    canActivate: [unauthGuard],
    loadComponent: () => import('./features/auth/reset-password').then(m => m.ResetPasswordComponent)
  },

  // Rutas privadas (requieren sesión válida)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/group/:groupName',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/group-dashboard').then(m => m.GroupDashboardComponent)
  },
  {
    path: 'settings',
    // Exclusivo de Admin: bloquea la renderización completa para Viewers.
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent)
  },
  {
    path: 'profile',
    // Disponible para cualquier rol autenticado: solo cambio de la propia contraseña.
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
  },

  // Ruta comodín — redirige al dashboard
  { path: '**', redirectTo: '/dashboard' }
];
