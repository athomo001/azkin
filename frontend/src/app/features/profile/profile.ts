// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

/**
 * Página de autoservicio disponible para CUALQUIER rol autenticado (admin o viewer):
 * solo cambio de la propia contraseña. Separada de /settings (exclusiva de admin) para
 * cerrar la exposición de datos administrativos a viewers.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <nav class="bg-zinc-900/40 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div class="flex items-center gap-3">
          <button routerLink="/dashboard" class="text-zinc-500 hover:text-orange-500 transition-colors" title="Volver al Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <img src="logo-azkin.png" alt="Azkin Logo" class="h-6 w-auto">
          <h1 class="text-xl font-black text-orange-500 tracking-tight cursor-pointer" routerLink="/dashboard">Azkin</h1>
          <span class="text-zinc-700">/</span>
          <span class="text-zinc-300 font-semibold text-sm">Mi Perfil</span>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="themeService.toggle($event)" class="text-zinc-400 hover:text-orange-500 transition-colors p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40" title="Cambiar tema">
            @if (themeService.isLightTheme()) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-amber-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M3 12h2.25m-.386-6.364 1.591 1.591M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            }
          </button>
          <button (click)="lang.toggleLanguage()" class="text-zinc-400 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-950/40 text-[10px] font-black uppercase tracking-wider">
            {{ lang.currentLang() }}
          </button>
        </div>
      </nav>

      @if (toast()) {
        <div class="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl bg-zinc-900 border-zinc-800 text-white animate-fade-in">
          <span class="w-2 h-2 mt-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          <span>{{ toast() }}</span>
        </div>
      }

      <main class="flex-1 p-6 lg:p-10 max-w-xl w-full mx-auto space-y-8">
        <div class="space-y-2">
          <h2 class="text-2xl font-black tracking-tight text-white">Mi Perfil</h2>
          <p class="text-zinc-400 text-xs">Sesión: {{ authService.currentUser()?.email || authService.currentUser()?.username }} ({{ authService.currentUser()?.role }})</p>
        </div>

        <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
          <div class="p-6 space-y-6">
            <div>
              <h3 class="text-sm font-bold text-white tracking-tight">{{ lang.t('settings.profile.changeTitle') }}</h3>
              <p class="text-[11px] text-zinc-500 mt-0.5">{{ lang.t('settings.profile.changeDesc') }}</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.profile.newPass') }}</label>
                <input type="password" [(ngModel)]="profileForm.newPassword" placeholder="Mínimo 8 caracteres"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.profile.confirmPass') }}</label>
                <input type="password" [(ngModel)]="profileForm.confirmPassword" placeholder="••••••••"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
              </div>
            </div>
          </div>

          <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end">
            <button (click)="onChangeOwnPassword()" class="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
              {{ lang.t('settings.profile.saveBtn') }}
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `]
})
export class ProfileComponent {
  private readonly http = inject(HttpClient);
  public readonly authService = inject(AuthService);
  public readonly lang = inject(LanguageService);
  public readonly themeService = inject(ThemeService);

  readonly toast = signal<string | null>(null);
  profileForm = { newPassword: '', confirmPassword: '' };

  private showToastFeedback(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 4000);
  }

  onChangeOwnPassword(): void {
    const { newPassword, confirmPassword } = this.profileForm;
    if (!newPassword || newPassword.length < 8) {
      this.showToastFeedback('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.showToastFeedback('Las contraseñas no coinciden.');
      return;
    }
    this.http.put('/api/v1/users/profile/password', { newPassword }).subscribe({
      next: () => {
        this.profileForm = { newPassword: '', confirmPassword: '' };
        this.showToastFeedback('Contraseña actualizada exitosamente.');
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al cambiar la contraseña.'));
      }
    });
  }
}
