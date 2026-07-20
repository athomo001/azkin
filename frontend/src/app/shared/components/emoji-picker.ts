// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, input, output } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

/** Selector de emojis genérico, extraido de settings.ts. */
@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="cancel.emit()"></div>
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
          <h4 class="text-sm font-bold text-white font-black">Selecciona un emoji</h4>
          <div class="grid grid-cols-8 gap-1.5 max-h-64 overflow-y-auto pr-1">
            @for (e of options(); track e) {
              <button type="button" (click)="pick.emit(e)"
                class="text-lg p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">{{ e }}</button>
            }
          </div>
          <button (click)="cancel.emit()" class="w-full py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
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
export class EmojiPickerComponent {
  readonly lang = inject(LanguageService);

  readonly open = input.required<boolean>();
  readonly options = input.required<string[]>();

  readonly pick = output<string>();
  readonly cancel = output<void>();
}
