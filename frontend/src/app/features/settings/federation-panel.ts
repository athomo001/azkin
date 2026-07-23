// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FederationService,
  IFederatedInstance,
  IFederatedMonitorLink,
  IRemoteMonitorSummary,
} from '../../core/services/federation.service';
import { MonitorService } from '../../core/services/monitor.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

/**
 * Pestaña "Federación": enrollment con otras instancias Azkin (AZ-049), máximo 5 simultáneas por
 * decisión de alcance (ver ISSUES.md AZ-049) — el backend rechaza la sexta con un error claro.
 * No es una CA: la confianza es pinning por huella de certificado autofirmado.
 */
@Component({
  selector: 'app-federation-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- ================= ENROLLMENT ================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">Invitar a otra instancia</h3>
            <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">Genera un código de un solo uso (expira en 20 min) que el Admin de la otra instancia pega en su propio panel de Federación.</p>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">URL pública de esta instancia</label>
            <input type="text" [(ngModel)]="tokenForm.ownUrl" placeholder="https://mi-azkin.miempresa.cl"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
          </div>
          <button (click)="onCreateToken()" class="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
            Generar código de enrollment
          </button>
          @if (generatedCode()) {
            <div class="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3 space-y-2">
              <p class="text-[10px] text-zinc-500">Código (válido hasta {{ codeExpiresAt() }}):</p>
              <code class="block text-[10px] text-emerald-400 break-all font-mono">{{ generatedCode() }}</code>
              <button (click)="copyCode()" class="text-[10px] text-orange-400 hover:text-orange-300 font-bold">Copiar</button>
            </div>
          }
        </div>

        <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">Unirse con un código</h3>
            <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">Pega el código que te compartió el Admin de la otra instancia.</p>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Código de enrollment</label>
            <textarea [(ngModel)]="joinForm.code" rows="2" placeholder="Pega el código acá"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-mono"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cómo llamarás a ese par</label>
              <input type="text" [(ngModel)]="joinForm.peerLabel" placeholder="Ej. China-VPS1"
                class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cómo te identificas tú</label>
              <input type="text" [(ngModel)]="joinForm.ownLabel" placeholder="Ej. Chile-VPS1"
                class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tu propia URL pública</label>
            <input type="text" [(ngModel)]="joinForm.ownUrl" placeholder="https://mi-azkin.miempresa.cl"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
          </div>
          <button (click)="onJoin()" class="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
            Unirse a la federación
          </button>
        </div>
      </div>

      <!-- ================= INSTANCIAS FEDERADAS ================= -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Instancias federadas</h3>
          <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ federation.instances().length }}/5</span>
        </div>
        @if (federation.instances().length === 0) {
          <div class="text-center py-10 bg-zinc-900/10 border border-zinc-800/80 rounded-xl">
            <p class="text-zinc-500 text-xs font-medium">No hay instancias federadas todavía.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (i of federation.instances(); track i.id) {
              <div class="bg-zinc-900/20 border rounded-xl p-4 flex flex-col gap-2"
                [class.border-emerald-900/50]="i.status === 'enrolled'" [class.border-zinc-850]="i.status === 'revoked'">
                <div class="flex justify-between items-start gap-2">
                  <span class="text-xs font-black text-zinc-200">{{ i.label }}</span>
                  <span class="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0"
                    [class]="i.status === 'enrolled' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border border-zinc-700 text-zinc-500'">
                    {{ i.status === 'enrolled' ? 'Enrolada' : 'Revocada' }}
                  </span>
                </div>
                <p class="text-[10px] text-zinc-500 font-mono">{{ i.remoteUrl }}:{{ i.remoteFederationPort }}</p>
                <p class="text-[10px] text-zinc-600">
                  {{ i.lastSuccessfulSyncAt ? ('Último sondeo: ' + (i.lastSuccessfulSyncAt | date: 'short')) : 'Sin sondeo todavía' }}
                  @if (i.notifiedDown) { <span class="text-rose-400 font-bold"> · sin reportar</span> }
                </p>
                @if (i.status === 'enrolled') {
                  <div class="flex items-center justify-end gap-3 border-t border-zinc-900 pt-2 text-[10px] font-bold">
                    <button (click)="onExploreMonitors(i)" class="text-zinc-400 hover:text-zinc-200 transition-colors">Explorar monitores</button>
                    <button (click)="onRevoke(i)" class="text-rose-500 hover:text-rose-400 transition-colors">Revocar</button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- ================= VINCULAR MONITORES ================= -->
      @if (exploringInstance()) {
        <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <h3 class="text-sm font-bold text-white tracking-tight">Vincular monitor con "{{ exploringInstance()!.label }}"</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Mi monitor local</label>
              <select [(ngModel)]="linkForm.localMonitorId" class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                <option value="">Selecciona...</option>
                @for (m of monitorService.monitors(); track m.id) {
                  <option [value]="m.id">{{ m.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Monitor remoto equivalente</label>
              <select [(ngModel)]="linkForm.remoteMonitorId" (change)="onRemoteMonitorSelected()" class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                <option value="">Selecciona...</option>
                @for (m of remoteMonitors(); track m.id) {
                  <option [value]="m.id">{{ m.name }} ({{ m.type }})</option>
                }
              </select>
            </div>
            <div class="flex items-end">
              <button (click)="onCreateLink()" class="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
                Crear vínculo
              </button>
            </div>
          </div>
          <button (click)="exploringInstance.set(null)" class="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold">Cerrar</button>
        </div>
      }

      <!-- ================= VÍNCULOS EXISTENTES ================= -->
      <div class="space-y-3">
        <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Vínculos de monitoreo</h3>
        @if (federation.links().length === 0) {
          <div class="text-center py-10 bg-zinc-900/10 border border-zinc-800/80 rounded-xl">
            <p class="text-zinc-500 text-xs font-medium">No hay monitores vinculados todavía.</p>
          </div>
        } @else {
          <div class="space-y-2">
            @for (l of federation.links(); track l.id) {
              <div class="bg-zinc-900/10 border border-zinc-850 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3">
                <div>
                  <span class="text-[11px] font-bold text-zinc-300">{{ monitorNameById(l.localMonitorId) }}</span>
                  <span class="text-[10px] text-zinc-600 mx-2">↔</span>
                  <span class="text-[11px] text-zinc-400">{{ l.remoteMonitorLabel }}</span>
                  <span class="text-[9px] text-zinc-600 ml-2">{{ l.lastSyncedAt ? ('sincronizado ' + (l.lastSyncedAt | date: 'short')) : 'sin sincronizar' }}</span>
                </div>
                <button (click)="onDeleteLink(l)" class="text-[10px] text-rose-500 hover:text-rose-400 font-bold transition-colors">Eliminar</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class FederationPanelComponent {
  readonly federation = inject(FederationService);
  readonly monitorService = inject(MonitorService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly generatedCode = signal<string | null>(null);
  readonly codeExpiresAt = signal<string>('');
  readonly exploringInstance = signal<IFederatedInstance | null>(null);
  readonly remoteMonitors = signal<IRemoteMonitorSummary[]>([]);

  tokenForm = { ownUrl: '' };
  joinForm = { code: '', peerLabel: '', ownLabel: '', ownUrl: '' };
  linkForm = { localMonitorId: '', remoteMonitorId: '', remoteMonitorLabel: '' };

  constructor() {
    this.federation.loadInstances().subscribe();
    this.federation.loadLinks().subscribe();
  }

  monitorNameById(id: string): string {
    return this.monitorService.monitors().find((m) => m.id === id)?.name ?? id;
  }

  onCreateToken(): void {
    if (!this.tokenForm.ownUrl.trim()) {
      this.toast.show('Indica la URL pública de esta instancia.');
      return;
    }
    this.federation.createEnrollmentToken(this.tokenForm.ownUrl).subscribe({
      next: (result) => {
        this.generatedCode.set(result.code);
        this.codeExpiresAt.set(new Date(result.expiresAt).toLocaleTimeString());
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al generar el código de enrollment.')),
    });
  }

  copyCode(): void {
    const code = this.generatedCode();
    if (!code) return;
    navigator.clipboard?.writeText(code);
    this.toast.show('Código copiado al portapapeles.');
  }

  onJoin(): void {
    if (!this.joinForm.code.trim() || !this.joinForm.peerLabel.trim() || !this.joinForm.ownLabel.trim() || !this.joinForm.ownUrl.trim()) {
      this.toast.show('Completa todos los campos para unirte a la federación.');
      return;
    }
    this.federation.join({ ...this.joinForm }).subscribe({
      next: () => {
        this.toast.show(`Federación con "${this.joinForm.peerLabel}" creada.`);
        this.joinForm = { code: '', peerLabel: '', ownLabel: '', ownUrl: this.joinForm.ownUrl };
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al unirse a la federación.')),
    });
  }

  onRevoke(instance: IFederatedInstance): void {
    this.confirm.ask(
      '¿Revocar esta federación?',
      `"${instance.label}" dejará de poder intercambiar datos de inmediato. Esta acción no se puede deshacer.`,
      () => {
        this.federation.revokeInstance(instance.id).subscribe({
          next: () => this.toast.show('Federación revocada.'),
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al revocar la federación.')),
        });
      },
    );
  }

  onExploreMonitors(instance: IFederatedInstance): void {
    this.exploringInstance.set(instance);
    this.linkForm = { localMonitorId: '', remoteMonitorId: '', remoteMonitorLabel: '' };
    this.federation.listRemoteMonitors(instance.id).subscribe({
      next: (monitors) => this.remoteMonitors.set(monitors),
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al explorar los monitores del par.')),
    });
  }

  onRemoteMonitorSelected(): void {
    const monitor = this.remoteMonitors().find((m) => m.id === this.linkForm.remoteMonitorId);
    this.linkForm.remoteMonitorLabel = monitor ? `${monitor.name} (${this.exploringInstance()?.label})` : '';
  }

  onCreateLink(): void {
    const instance = this.exploringInstance();
    if (!instance || !this.linkForm.localMonitorId || !this.linkForm.remoteMonitorId) {
      this.toast.show('Selecciona un monitor local y uno remoto.');
      return;
    }
    this.federation.createLink({
      localMonitorId: this.linkForm.localMonitorId,
      federatedInstanceId: instance.id,
      remoteMonitorId: this.linkForm.remoteMonitorId,
      remoteMonitorLabel: this.linkForm.remoteMonitorLabel,
    }).subscribe({
      next: () => {
        this.toast.show('Vínculo creado.');
        this.exploringInstance.set(null);
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al crear el vínculo.')),
    });
  }

  onDeleteLink(link: IFederatedMonitorLink): void {
    this.confirm.ask(
      '¿Eliminar este vínculo?',
      'Se dejará de comparar este monitor con el par federado.',
      () => {
        this.federation.deleteLink(link.id).subscribe({
          next: () => this.toast.show('Vínculo eliminado.'),
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al eliminar el vínculo.')),
        });
      },
    );
  }
}
