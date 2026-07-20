// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';

/**
 * Modal de cambio/reseteo de contraseña — unifica los modales casi identicos que
 * settings.ts tenia por separado para Admin y Viewer (AZ-016). El padre sigue siendo dueño
 * del valor de la contraseña (input/output controlado), como antes de la extraccion.
 */
@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="cancel.emit()"></div>
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white font-black">{{ title() }}</h4>
              <p class="text-[10px] text-zinc-500">{{ subtitle() }}</p>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.profile.newPass') }}</label>
            <input type="password" [ngModel]="password()" (ngModelChange)="passwordChange.emit($event)" [placeholder]="lang.t('settings.viewers.minChars')"
              class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
          </div>
          <div class="flex gap-3 pt-2">
            <button (click)="cancel.emit()" class="flex-1 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
            <button (click)="save.emit()" class="flex-1 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md">{{ lang.t('common.save') }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `]
})
export class ChangePasswordModalComponent {
  readonly lang = inject(LanguageService);

  readonly open = input.required<boolean>();
  readonly title = input('');
  readonly subtitle = input('');
  readonly password = input('');

  readonly passwordChange = output<string>();
  readonly cancel = output<void>();
  readonly save = output<void>();
}
