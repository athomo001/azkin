// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

/** Toast de feedback — una sola instancia por pagina, lee su estado de ToastService (AZ-016). */
@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (toastService.message()) {
      <div class="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl bg-zinc-900 border-zinc-800 text-white animate-fade-in">
        <span class="w-2 h-2 mt-1.5 rounded-full bg-orange-500 animate-pulse"></span>
        <span>{{ toastService.message() }}</span>
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
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
