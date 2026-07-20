// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Navbar del dashboard: logo (vuelve a Quick Stats), tema/idioma, info de usuario, easter egg
 * NyanCat (admin), link a settings/perfil, logout. Extraido de dashboard.ts.
 *
 * `isNyanCatMode` se recibe como input (en vez de tener su propio signal) porque ese estado
 * también lo lee el renderizado de los gráficos ECharts en el shell — esa parte permanece en el
 * shell por ahora (ver nota "Fuera de alcance" en ISSUES.md), así que el signal debe seguir viviendo
 * ahí. Este componente solo refleja su valor y emite la intención de cambiarlo.
 */
@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-40">
      <div class="flex items-center space-x-3">
        <img src="logo-azkin.png" alt="Azkin Logo" class="h-6 w-auto">
        <h1 class="text-2xl font-black text-orange-500 tracking-tight cursor-pointer hover:opacity-85 transition-opacity" (click)="logoClick.emit()">Azkin</h1>
        <span class="text-xs text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-900/80">PROD</span>
      </div>
      <div class="flex items-center space-x-6">
        <button (click)="themeService.toggle($event)" class="text-zinc-400 hover:text-orange-500 transition-colors p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40" title="Cambiar tema">
          @if (themeService.isLightTheme()) {
            <!-- Sun Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-amber-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M3 12h2.25m-.386-6.364 1.591 1.591M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
            </svg>
          } @else {
            <!-- Moon Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          }
        </button>
        <button (click)="lang.toggleLanguage()" class="text-zinc-400 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-950/40 text-[10px] font-black uppercase tracking-wider" [title]="lang.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'">
          {{ lang.currentLang() }}
        </button>
        <div class="flex flex-col text-right">
          <span class="text-xs font-bold text-zinc-300">{{ authService.currentUser()?.email || authService.currentUser()?.username }}</span>
          <span class="text-[10px] text-zinc-500 uppercase tracking-wider">{{ authService.currentUser()?.role }}</span>
        </div>
        <!-- Boton secreto de NyanCat (Easter Egg) — solo para admins -->
        @if (authService.isAdmin()) {
          <button (click)="toggleNyanCat.emit()" [title]="isNyanCatMode() ? 'Desactivar Modo NyanCat' : 'Activar Modo NyanCat 🐱'"
            class="flex items-center justify-center p-1.5 rounded-lg border transition-all text-xs"
            [class]="isNyanCatMode() ? 'border-orange-500/40 bg-orange-500/10 text-orange-400' : 'border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:text-orange-400 hover:border-orange-500/30'">
            🐱
          </button>
        }
        @if (authService.isAdmin()) {
          <a routerLink="/settings" class="text-sm font-semibold hover:text-orange-500 transition-colors flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            {{ lang.t('nav.settings') }}
          </a>
        } @else {
          <a routerLink="/profile" class="text-sm font-semibold hover:text-orange-500 transition-colors flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Mi Perfil
          </a>
        }
        <button (click)="onLogout()" class="text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
          </svg>
          {{ lang.t('nav.logout') }}
        </button>
      </div>
    </nav>
  `
})
export class DashboardNavbarComponent {
  readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isNyanCatMode = input.required<boolean>();

  readonly logoClick = output<void>();
  readonly toggleNyanCat = output<void>();

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
