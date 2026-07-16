import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

type ToastType = 'error' | 'success';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6 relative">
      <!-- Selector de Idioma Flotante Superior Derecho -->
      <div class="absolute top-6 right-6">
        <button (click)="lang.toggleLanguage()"
          class="text-zinc-400 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-[10px] font-black uppercase tracking-wider"
          [title]="lang.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'">
          {{ lang.currentLang() === 'es' ? 'EN' : 'ES' }}
        </button>
      </div>

      <div class="w-full max-w-md space-y-4">

        <!-- Toast de notificación inline (reemplaza alert()) -->
        @if (toast()) {
          <div [class]="toastClass()"
            class="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg animate-fade-in"
            role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="2" stroke="currentColor" class="w-4 h-4 mt-0.5 flex-shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{{ toast() }}</span>
          </div>
        }

        <!-- Tarjeta principal glassmorphism -->
        <div class="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div class="flex items-center gap-3.5 mb-2">
            <img src="logo-azkin.png" alt="Azkin Logo" class="h-10 w-auto">
            <h2 class="text-3xl font-extrabold tracking-tight text-emerald-500">Azkin</h2>
          </div>
          <p class="text-zinc-400 mb-6 text-sm">{{ lang.t('auth.login.subtitle') }}</p>

          <form (submit)="onSubmit(); $event.preventDefault()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                {{ lang.t('auth.login.email') }}
              </label>
              <input type="email" name="email" [(ngModel)]="email" required
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors">
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                {{ lang.t('auth.login.password') }}
              </label>
              <input type="password" name="password" [(ngModel)]="password" required
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors">
            </div>

            <button type="submit" [disabled]="isLoading()"
              class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-zinc-400 font-semibold rounded-lg py-3 mt-4 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 duration-200">
              {{ isLoading() ? lang.t('auth.login.btnLoading') : lang.t('auth.login.btn') }}
            </button>
          </form>

          <p class="text-zinc-500 text-xs text-center mt-6">
            {{ lang.t('auth.login.noAccount') }}
            <a routerLink="/register" class="text-emerald-500 hover:underline">{{ lang.t('auth.login.registerHere') }}</a>
          </p>
        </div>
      </div>
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
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly lang = inject(LanguageService);

  email = '';
  password = '';
  readonly isLoading = signal(false);

  // Mensaje del toast activo y su tipo (error | success)
  readonly toast = signal<string | null>(null);
  readonly toastType = signal<ToastType>('error');

  /** Clase CSS del toast según su tipo */
  readonly toastClass = () =>
    this.toastType() === 'error'
      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  /** Muestra un toast y lo descarta automáticamente después de 4 segundos */
  private showToast(message: string, type: ToastType = 'error'): void {
    this.toastType.set(type);
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 4000);
  }

  onSubmit(): void {
    this.toast.set(null);
    this.isLoading.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.showToast(this.lang.t('auth.login.error'));
        this.isLoading.set(false);
      }
    });
  }
}
