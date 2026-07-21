// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

interface ApiKeyEntry {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: ('read' | 'write')[];
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

/** Pestaña "API": gestión de API Keys para la API pública. Extraido de settings.ts. */
@Component({
  selector: 'app-api-keys-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      <div class="p-6 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-white tracking-tight">API Pública</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5">
            Genera API Keys para integrar sistemas externos con Azkin vía <code class="text-orange-400">X-API-Key</code>. Ver <code class="text-orange-400">docs/api-publica.md</code> para ejemplos.
          </p>
        </div>

        <div class="flex items-end gap-3 border-t border-zinc-850 pt-4">
          <div class="flex-1">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre de la key</label>
            <input type="text" [(ngModel)]="apiKeyForm.name" placeholder="Ej. Integración Grafana"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500">
          </div>
          <label class="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer pb-2.5">
            <input type="checkbox" [(ngModel)]="apiKeyForm.canWrite" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
            Permitir escritura
          </label>
          <button (click)="onCreateApiKey()" class="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">Generar</button>
        </div>

        <div class="border-t border-zinc-850 pt-4 space-y-2">
          <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Keys activas</span>
          @if (apiKeys().length === 0) {
            <p class="text-[11px] text-zinc-600">Aún no hay API Keys generadas.</p>
          } @else {
            @for (k of apiKeys(); track k.id) {
              <div class="flex items-center justify-between bg-zinc-950/60 border border-zinc-900 px-3 py-2 rounded-lg text-[11px]">
                <div class="space-y-0.5">
                  <span class="text-zinc-200 font-semibold">{{ k.name }}</span>
                  <span class="block text-zinc-600 font-mono text-[10px]">{{ k.keyPrefix }}••••••••</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[9px] bg-zinc-950 px-1.5 py-0.5 border border-zinc-800/80 text-zinc-500 rounded font-mono uppercase font-bold">{{ k.scopes.join('/') }}</span>
                  @if (k.revokedAt) {
                    <span class="text-[9px] text-rose-500 font-bold uppercase">Revocada</span>
                  } @else {
                    <button (click)="onRevokeApiKey(k.id)" class="text-rose-500 hover:text-rose-400 font-bold">Revocar</button>
                  }
                  <button (click)="onDeleteApiKey(k.id)" class="text-zinc-500 hover:text-rose-400 font-bold">Eliminar</button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- Modal: API Key generada (se muestra una única vez) -->
    @if (newlyCreatedApiKey(); as created) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
          <h4 class="text-sm font-bold text-white font-black">API Key generada</h4>
          <p class="text-[11px] text-rose-400 font-semibold">Cópiala ahora — no se puede recuperar de nuevo.</p>
          <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-orange-400 break-all select-all">{{ created.plainKey }}</div>
          <button (click)="copyApiKey(created.plainKey)" class="w-full py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">Copiar al portapapeles</button>
          <button (click)="newlyCreatedApiKey.set(null)" class="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md">Ya la copié, cerrar</button>
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
export class ApiKeysPanelComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly apiKeys = signal<ApiKeyEntry[]>([]);
  readonly newlyCreatedApiKey = signal<{ plainKey: string; name: string } | null>(null);
  apiKeyForm = { name: '', canWrite: false };

  constructor() {
    this.loadApiKeys();
  }

  loadApiKeys(): void {
    this.http.get<ApiKeyEntry[]>('/api/v1/api-keys').subscribe({
      next: (data) => this.apiKeys.set(data),
      error: () => {}
    });
  }

  onCreateApiKey(): void {
    if (!this.apiKeyForm.name.trim()) {
      this.toast.show('El nombre de la key es obligatorio.');
      return;
    }
    const scopes: ('read' | 'write')[] = this.apiKeyForm.canWrite ? ['read', 'write'] : ['read'];
    this.http.post<{ plainKey: string; name: string }>('/api/v1/api-keys', { name: this.apiKeyForm.name, scopes }).subscribe({
      next: (res) => {
        this.newlyCreatedApiKey.set({ plainKey: res.plainKey, name: res.name });
        this.apiKeyForm = { name: '', canWrite: false };
        this.loadApiKeys();
      },
      error: (err) => {
        this.toast.show(extractApiErrorMessage(err, 'Error al generar la API Key.'));
      }
    });
  }

  onRevokeApiKey(id: string): void {
    this.confirm.ask(
      '¿Revocar API Key?',
      'Cualquier sistema que use esta key dejará de poder autenticarse inmediatamente.',
      () => {
        this.http.delete(`/api/v1/api-keys/${id}`).subscribe({
          next: () => {
            this.toast.show('API Key revocada.');
            this.loadApiKeys();
          },
          error: () => this.toast.show('Error al revocar la API Key.')
        });
      }
    );
  }

  onDeleteApiKey(id: string): void {
    this.confirm.ask(
      '¿Eliminar API Key?',
      'Se borrará permanentemente — a diferencia de revocar, esta acción no se puede deshacer y la key desaparecerá de esta lista.',
      () => {
        this.http.delete(`/api/v1/api-keys/${id}/purge`).subscribe({
          next: () => {
            this.toast.show('API Key eliminada.');
            this.loadApiKeys();
          },
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al eliminar la API Key.'))
        });
      }
    );
  }

  copyApiKey(key: string): void {
    navigator.clipboard.writeText(key).then(() => this.toast.show('Copiada al portapapeles.'));
  }
}
