// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { ConfirmService } from '../../core/services/confirm.service';

/**
 * Modal de confirmacion generico — una sola instancia por pagina, montada fuera de cualquier
 * condicional de pestana/panel. Lee su estado directamente de ConfirmService: los
 * paneles que necesitan confirmar una accion inyectan ConfirmService y llaman a `ask(...)`,
 * sin duplicar su propio triada de signals para esto.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (confirmService.open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="confirmService.cancel()"></div>
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in text-center space-y-5">
          <div class="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider font-black">{{ confirmService.title() }}</h4>
            <p class="text-xs text-zinc-400 mt-2">{{ confirmService.message() }}</p>
          </div>
          <div class="flex gap-3 pt-2">
            <button (click)="confirmService.cancel()" class="flex-1 py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
            <button (click)="confirmService.confirm()" class="flex-1 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-lg">{{ lang.t('common.confirm') }}</button>
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
export class ConfirmModalComponent {
  readonly lang = inject(LanguageService);
  readonly confirmService = inject(ConfirmService);
}
