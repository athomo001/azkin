// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
      <div class="w-full max-w-md space-y-4">
        @if (toast()) {
          <div [class]="toastType() === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'"
            class="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg animate-fade-in" role="alert">
            <span>{{ toast() }}</span>
          </div>
        }

        <div class="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div class="flex items-center gap-3.5 mb-2">
            <img src="logo-azkin.png" alt="Azkin Logo" class="h-10 w-auto">
            <h2 class="text-3xl font-extrabold tracking-tight text-emerald-500">Azkin</h2>
          </div>
          <p class="text-zinc-400 mb-6 text-sm">{{ lang.t('auth.resetPassword.subtitle') }}</p>

          @if (!success()) {
            <form (submit)="onSubmit(); $event.preventDefault()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  {{ lang.t('auth.resetPassword.newPassword') }}
                </label>
                <input type="password" name="newPassword" [(ngModel)]="newPassword" required minlength="8"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors">
              </div>
              <button type="submit" [disabled]="isLoading() || !token"
                class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 font-semibold rounded-lg py-3 mt-4 transition-all shadow-lg active:scale-95 duration-200">
                {{ isLoading() ? lang.t('auth.resetPassword.btnLoading') : lang.t('auth.resetPassword.btn') }}
              </button>
            </form>
          } @else {
            <p class="text-zinc-300 text-sm">{{ lang.t('auth.resetPassword.success') }}</p>
          }

          <p class="text-zinc-500 text-xs text-center mt-6">
            <a routerLink="/login" class="text-emerald-500 hover:underline">{{ lang.t('auth.forgotPassword.backToLogin') }}</a>
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
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly lang = inject(LanguageService);

  token = '';
  newPassword = '';
  readonly isLoading = signal(false);
  readonly success = signal(false);
  readonly toast = signal<string | null>(null);
  readonly toastType = signal<'error' | 'success'>('error');

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.toastType.set('error');
      this.toast.set(this.lang.t('auth.resetPassword.missingToken'));
    }
  }

  onSubmit(): void {
    if (!this.token) return;
    this.isLoading.set(true);
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastType.set('error');
        this.toast.set(err?.error?.error?.message || this.lang.t('auth.resetPassword.error'));
      }
    });
  }
}
