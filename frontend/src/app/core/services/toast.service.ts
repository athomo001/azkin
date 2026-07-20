// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, signal } from '@angular/core';

/**
 * Toast de feedback compartido por toda la app — reemplaza el signal `toast`/
 * `showToastFeedback()` que antes cada componente (settings.ts, dashboard.ts) duplicaba
 * por su cuenta (AZ-016).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  show(message: string, durationMs = 4000): void {
    this.message.set(message);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.message.set(null), durationMs);
  }
}
