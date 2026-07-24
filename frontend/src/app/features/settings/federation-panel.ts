// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FederationService,
  IFederatedInstance,
  IFederatedMonitorLink,
  IFederationOwnUrlStatus,
  IRemoteMonitorSummary,
  ITestConnectionResult,
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
      <!-- ================= CONFIGURACIÓN DE RED PROPIA ================= -->
      <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-white tracking-tight">Configuración de red de esta instancia</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">Se configura una sola vez acá y se reutiliza automáticamente al invitar o unirte a una federación — no hace falta volver a escribirla. Corre sobre el mismo puerto que ya usás para entrar al dashboard, con o sin HTTPS nativo.</p>
        </div>
        <div class="space-y-2 max-w-md">
          <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mi dirección pública</label>
          <input type="text" [(ngModel)]="networkForm.ownUrl" placeholder="203.0.113.5 o mi-azkin.miempresa.cl"
            class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
          <button (click)="onSaveOwnUrl()" [disabled]="isSavingOwnUrl()"
            class="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-bold transition-all shadow-md">
            {{ isSavingOwnUrl() ? 'Guardando...' : 'Guardar dirección' }}
          </button>
        </div>
        <p class="text-[10px] text-amber-500/80 font-medium">Advertencia: si cambias esta dirección con pares ya enrolados, ellos seguirán intentando contactarte con el valor anterior hasta que vuelvan a enrolarse — no hay re-anuncio automático.</p>
      </div>

      <!-- ================= PROBAR CONECTIVIDAD ================= -->
      <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-white tracking-tight">Probar conectividad</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">Antes de invitar o unirte, probá si tu servidor alcanza la dirección y el puerto que te haya pasado el otro Admin (por chat, etc.) — no necesitás ningún código para esto.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Dirección (IP o dominio)</label>
            <input type="text" [(ngModel)]="testForm.host" placeholder="203.0.113.9"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Puerto</label>
            <input type="number" [(ngModel)]="testForm.port" placeholder="ej. 3000 o 443"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
          </div>
        </div>
        <button (click)="onTestAddress()" [disabled]="isTestingAddress()"
          class="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-xs font-bold transition-all shadow-md">
          {{ isTestingAddress() ? 'Probando...' : 'Probar' }}
        </button>
        @if (addressTestResult(); as tr) {
          <div class="bg-zinc-950/60 border rounded-lg p-3"
            [class.border-emerald-900/50]="tr.reachable" [class.border-rose-900/50]="!tr.reachable">
            <p class="text-[10px] font-semibold" [class.text-emerald-400]="tr.reachable" [class.text-rose-400]="!tr.reachable">
              {{ tr.reachable ? ('Alcanzable (' + tr.latencyMs + ' ms)') : ('No alcanzable — ' + tr.error) }}
            </p>
          </div>
        }
      </div>

      <!-- ================= ENROLLMENT ================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">Invitar a otra instancia</h3>
            <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">Genera un código de un solo uso (expira en 20 min) que el Admin de la otra instancia pega en su propio panel de Federación.</p>
          </div>
          @if (ownUrlStatus()?.ownUrl) {
            <p class="text-[10px] text-zinc-500">Se compartirá como tu dirección: <span class="font-mono text-zinc-300">{{ ownUrlStatus()?.ownUrl }}</span></p>
          } @else {
            <p class="text-[10px] text-amber-500/80 font-medium">Configura "Mi dirección pública" arriba antes de generar un código.</p>
          }
          <button (click)="onCreateToken()" [disabled]="!ownUrlStatus()?.ownUrl" class="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-bold transition-all shadow-md">
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
          @if (ownUrlStatus()?.ownUrl) {
            <p class="text-[10px] text-zinc-500">Te identificarás con tu dirección: <span class="font-mono text-zinc-300">{{ ownUrlStatus()?.ownUrl }}</span></p>
          } @else {
            <p class="text-[10px] text-amber-500/80 font-medium">Configura "Mi dirección pública" arriba antes de unirte.</p>
          }
          <button (click)="onJoin()" [disabled]="!ownUrlStatus()?.ownUrl" class="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-bold transition-all shadow-md">
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
                [class.border-emerald-900/50]="i.status === 'enrolled'"
                [class.border-zinc-850]="i.status === 'revoked'">
                <div class="flex justify-between items-start gap-2">
                  <span class="text-xs font-black text-zinc-200">{{ i.label }}</span>
                  <span class="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0"
                    [class]="i.status === 'enrolled' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'">
                    {{ i.status === 'enrolled' ? 'Enrolada' : 'Revocada' }}
                  </span>
                </div>
                <p class="text-[10px] text-zinc-500 font-mono">{{ i.remoteUrl }}</p>
                <p class="text-[10px] text-zinc-600">
                  {{ i.lastSuccessfulSyncAt ? ('Último sondeo: ' + (i.lastSuccessfulSyncAt | date: 'short')) : 'Sin sondeo todavía' }}
                  @if (i.notifiedDown) { <span class="text-rose-400 font-bold"> · sin reportar</span> }
                </p>
                <div class="flex items-center justify-end gap-3 border-t border-zinc-900 pt-2 text-[10px] font-bold">
                  @if (i.status === 'enrolled') {
                    <button (click)="onAutoLink(i)" class="text-orange-400 hover:text-orange-300 transition-colors">Auto-vincular</button>
                    <button (click)="onTestInstanceConnection(i)" class="text-zinc-400 hover:text-zinc-200 transition-colors">Probar conexión</button>
                    <button (click)="onExploreMonitors(i)" class="text-zinc-400 hover:text-zinc-200 transition-colors">Explorar monitores</button>
                    <button (click)="onRevoke(i)" class="text-amber-500 hover:text-amber-400 transition-colors">Revocar</button>
                  } @else {
                    <button (click)="onReactivate(i)" class="text-emerald-400 hover:text-emerald-300 transition-colors">Reactivar</button>
                  }
                  <button (click)="onDeleteInstance(i)" class="text-rose-500 hover:text-rose-400 transition-colors">Borrar</button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- ================= VINCULAR MONITORES ================= -->
      @if (exploringInstance()) {
        <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <h3 class="text-sm font-bold text-white tracking-tight">Vincular monitor con "{{ exploringInstance()!.label }}"</h3>
          @if (remoteMonitors().length === 0) {
            <p class="text-[11px] text-zinc-500 font-medium">Este par no tiene monitores para explorar, o todavía no responde.</p>
          }
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
  readonly ownUrlStatus = signal<IFederationOwnUrlStatus | null>(null);
  readonly isSavingOwnUrl = signal(false);
  readonly addressTestResult = signal<ITestConnectionResult | null>(null);
  readonly isTestingAddress = signal(false);

  joinForm = { code: '', peerLabel: '', ownLabel: '' };
  linkForm = { localMonitorId: '', remoteMonitorId: '', remoteMonitorLabel: '' };
  networkForm = { ownUrl: '' };
  testForm: { host: string; port: number | null } = { host: '', port: null };

  constructor() {
    this.federation.loadInstances().subscribe();
    this.federation.loadLinks().subscribe();
    this.monitorService.loadMonitors().subscribe();
    this.loadOwnUrlStatus();
  }

  private loadOwnUrlStatus(): void {
    this.federation.getOwnUrl().subscribe({
      next: (status) => {
        this.ownUrlStatus.set(status);
        this.networkForm.ownUrl = status.ownUrl ?? '';
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al consultar la configuración de red.')),
    });
  }

  onSaveOwnUrl(): void {
    if (!this.networkForm.ownUrl.trim()) {
      this.toast.show('Indica una dirección o URL.');
      return;
    }
    this.isSavingOwnUrl.set(true);
    this.federation.setOwnUrl(this.networkForm.ownUrl).subscribe({
      next: () => {
        this.isSavingOwnUrl.set(false);
        this.toast.show('Dirección pública guardada.');
        this.loadOwnUrlStatus();
      },
      error: (err) => {
        this.isSavingOwnUrl.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al guardar la dirección pública.'));
      },
    });
  }

  onTestAddress(): void {
    if (!this.testForm.host.trim() || !this.testForm.port) {
      this.toast.show('Indica una dirección y un puerto.');
      return;
    }
    this.isTestingAddress.set(true);
    this.federation.testAddress(this.testForm.host, this.testForm.port).subscribe({
      next: (result) => {
        this.isTestingAddress.set(false);
        this.addressTestResult.set(result);
      },
      error: (err) => {
        this.isTestingAddress.set(false);
        this.addressTestResult.set(null);
        this.toast.show(extractApiErrorMessage(err, 'Error al probar la conexión.'));
      },
    });
  }

  monitorNameById(id: string): string {
    return this.monitorService.monitors().find((m) => m.id === id)?.name ?? id;
  }

  onCreateToken(): void {
    this.federation.createEnrollmentToken().subscribe({
      next: (result) => {
        this.generatedCode.set(result.code);
        this.codeExpiresAt.set(new Date(result.expiresAt).toLocaleTimeString());
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al generar el código de enrollment.')),
    });
  }

  /**
   * Copia el código de enrollment generado al portapapeles.
   * Utiliza navigator.clipboard cuando está disponible, con un fallback a document.execCommand
   * para entornos HTTP o IP directa donde la API Clipboard no es expuesta por el navegador.
   */
  copyCode(): void {
    const code = this.generatedCode();
    if (!code) return;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(code).then(
        () => this.toast.show('Código copiado al portapapeles.'),
        () => this.fallbackCopyCode(code)
      );
    } else {
      this.fallbackCopyCode(code);
    }
  }

  private fallbackCopyCode(code: string): void {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        this.toast.show('Código copiado al portapapeles.');
      } else {
        this.toast.show('No se pudo copiar el código automáticamente.');
      }
    } catch {
      this.toast.show('No se pudo copiar el código automáticamente.');
    }
  }

  onJoin(): void {
    if (!this.joinForm.code.trim()) {
      this.toast.show('Ingresa el código de enrollment.');
      return;
    }
    this.federation.join({ ...this.joinForm }).subscribe({
      next: (instance) => {
        this.toast.show(`Federación con "${instance.label}" enlazada exitosamente.`);
        this.joinForm = { code: '', peerLabel: '', ownLabel: '' };
        // Gatillar auto-vinculación asíncrona de monitores coincidentes
        this.onAutoLink(instance);
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al unirse a la federación.')),
    });
  }

  onAutoLink(instance: IFederatedInstance): void {
    this.federation.autoLinkMonitors(instance.id).subscribe({
      next: (res) => {
        if (res.linkedCount > 0) {
          this.toast.show(`Se vincularon automáticamente ${res.linkedCount} monitores coincidentes con "${instance.label}".`);
        }
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al auto-vincular monitores.')),
    });
  }

  onTestInstanceConnection(instance: IFederatedInstance): void {
    this.federation.testInstanceConnection(instance.id).subscribe({
      next: (result) => {
        this.toast.show(
          `"${instance.label}": ${result.reachable ? `Alcanzable (${result.latencyMs} ms)` : `No alcanzable — ${result.error}`}`,
        );
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al probar la conexión.')),
    });
  }

  onRevoke(instance: IFederatedInstance): void {
    this.confirm.ask(
      '¿Revocar esta federación?',
      `"${instance.label}" dejará de poder intercambiar datos de inmediato.`,
      () => {
        this.federation.revokeInstance(instance.id).subscribe({
          next: () => this.toast.show('Federación revocada.'),
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al revocar la federación.')),
        });
      },
    );
  }

  onReactivate(instance: IFederatedInstance): void {
    this.federation.reactivateInstance(instance.id).subscribe({
      next: () => this.toast.show(`Federación con "${instance.label}" reactivada.`),
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al reactivar la federación.')),
    });
  }

  onDeleteInstance(instance: IFederatedInstance): void {
    this.confirm.ask(
      '¿Eliminar esta instancia federada?',
      `Se eliminará permanentemente "${instance.label}" y todos los vínculos de monitoreo asociados. Esta acción no se puede deshacer.`,
      () => {
        this.federation.deleteInstance(instance.id).subscribe({
          next: () => {
            if (this.exploringInstance()?.id === instance.id) {
              this.exploringInstance.set(null);
            }
            this.toast.show('Instancia federada eliminada.');
            this.federation.loadLinks().subscribe();
          },
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al eliminar la instancia federada.')),
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
        this.toast.show('Vínculo creado y datos sincronizados.');
        this.exploringInstance.set(null);
        this.federation.loadLinks().subscribe();
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
