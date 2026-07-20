// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, signal } from '@angular/core';

/**
 * Estado del modal de confirmacion generico, compartido por toda la app — reemplaza la
 * triada showConfirmModal/confirmModalTitle/confirmModalMsg/confirmActionCallback que antes
 * cada componente (settings.ts, dashboard.ts) duplicaba por su cuenta.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly open = signal(false);
  readonly title = signal('');
  readonly message = signal('');
  private callback: (() => void) | null = null;

  ask(title: string, message: string, onConfirm: () => void): void {
    this.title.set(title);
    this.message.set(message);
    this.callback = onConfirm;
    this.open.set(true);
  }

  cancel(): void {
    this.open.set(false);
    this.callback = null;
  }

  confirm(): void {
    const callback = this.callback;
    this.cancel();
    if (callback) callback();
  }
}
