// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitorService, IMonitor } from '../../core/services/monitor.service';
import { NotificationService } from '../../core/services/notification.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

/**
 * Slide-over de edición masiva para todos los monitores de un grupo. A diferencia de
 * app-monitor-form, cada sección lleva su propio checkbox "aplicar este cambio": si no se marca,
 * ese campo no se incluye en el patch — evita pisar `tags`/`notificationIds` existentes con un
 * valor vacío por accidente cuando el usuario solo quería tocar otra sección.
 */
@Component({
  selector: 'app-group-bulk-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end overflow-hidden">
      <div (click)="cancel.emit()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

      <div class="relative w-full max-w-xl bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl flex flex-col justify-between animate-slide-in">
        <div class="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div>
            <h3 class="text-lg font-black text-orange-500">Edición masiva de grupo</h3>
            <p class="text-xs text-zinc-500 mt-1">{{ groupName() }} — {{ monitors().length }} monitor(es)</p>
          </div>
          <button (click)="cancel.emit()" aria-label="Cerrar" title="Cerrar" class="text-zinc-500 hover:text-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          @if (formError()) {
            <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2 animate-fade-in mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{{ formError() }}</span>
            </div>
          }

          <!-- Sección 2: Temporizadores y Umbrales (solo Ignorar SSL/TLS) -->
          <div class="space-y-3 border border-zinc-800 rounded-xl p-4">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" [(ngModel)]="applyIgnoreTls" class="rounded border-zinc-800 text-orange-500 focus:ring-0 cursor-pointer">
              <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Temporizadores y Umbrales</span>
            </label>
            @if (applyIgnoreTls) {
              <div class="pl-6 space-y-2 animate-fade-in">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" [(ngModel)]="ignoreTlsValue" class="rounded border-zinc-800 text-orange-500 focus:ring-0 cursor-pointer">
                  <span class="text-xs text-zinc-300 font-bold">Ignorar errores de certificado SSL/TLS</span>
                </label>
                <p class="text-[11px] text-zinc-500">{{ httpNote() }}</p>
              </div>
            }
          </div>

          <!-- Sección 3: Agrupación y Clasificación (solo Etiquetas) -->
          <div class="space-y-3 border border-zinc-800 rounded-xl p-4">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" [(ngModel)]="applyTags" class="rounded border-zinc-800 text-orange-500 focus:ring-0 cursor-pointer">
              <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Agrupación y Clasificación</span>
            </label>
            @if (applyTags) {
              <div class="pl-6 animate-fade-in">
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Etiquetas (reemplaza las actuales)</label>
                <input type="text" [ngModel]="tagsString()" (ngModelChange)="setTagsFromString($event)" placeholder="Ej. aws, core, api"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
              </div>
            }
          </div>

          <!-- Sección 4: Canales de Alerta Activos -->
          <div class="space-y-3 border border-zinc-800 rounded-xl p-4">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" [(ngModel)]="applyNotifications" class="rounded border-zinc-800 text-orange-500 focus:ring-0 cursor-pointer">
              <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Canales de Alerta Activos</span>
            </label>
            @if (applyNotifications) {
              <div class="pl-6 animate-fade-in space-y-2 max-h-48 overflow-y-auto border border-zinc-800 p-3 rounded-xl bg-zinc-950/20">
                @if (notificationChannels().length === 0) {
                  <p class="text-xs text-zinc-500 font-semibold p-2">No hay canales de notificación configurados.</p>
                } @else {
                  @for (ch of notificationChannels(); track ch.id) {
                    <div class="flex items-center gap-3 p-1.5 hover:bg-zinc-900/60 rounded transition-colors">
                      <input type="checkbox"
                        [checked]="notificationIdsValue.includes(ch.id)"
                        (change)="toggleNotificationChannel(ch.id)"
                        [id]="'grp-ch-' + ch.id"
                        class="rounded border-zinc-850 text-orange-500 focus:ring-0 cursor-pointer">
                      <label [for]="'grp-ch-' + ch.id" class="text-xs text-zinc-300 font-bold cursor-pointer flex-1 flex items-center justify-between">
                        <span>{{ ch.name }}</span>
                        <span class="text-[9px] uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">{{ ch.type }}</span>
                      </label>
                    </div>
                  }
                }
              </div>
            }
          </div>

          <!-- Sección 5: Integridad Visual (Anti-Defacement) -->
          <div class="space-y-3 border border-zinc-800 rounded-xl p-4">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" [(ngModel)]="applyIntegrity" class="rounded border-zinc-800 text-orange-500 focus:ring-0 cursor-pointer">
              <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Integridad Visual (Anti-Defacement)</span>
            </label>
            @if (applyIntegrity) {
              <div class="pl-6 space-y-4 animate-fade-in">
                <p class="text-[11px] text-zinc-500">{{ httpNote() }}</p>
                <div class="flex items-center gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <input type="checkbox" [(ngModel)]="integrityEnabledValue" id="grpIntegrityEnabled" class="rounded border-zinc-800 text-orange-500 focus:ring-0">
                  <label for="grpIntegrityEnabled" class="text-xs text-zinc-300 font-semibold cursor-pointer">Activar chequeo de integridad visual</label>
                </div>
                @if (integrityEnabledValue) {
                  <div class="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Perfil</label>
                      <select [(ngModel)]="integrityProfileValue"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                        <option value="static">Estático (Static)</option>
                        <option value="dynamic">Dinámico (Dynamic)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Umbral de tolerancia</label>
                      <input type="number" [(ngModel)]="integrityThresholdValue" step="0.01" min="0" max="1"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Selectores CSS ignorados</label>
                      <input type="text" [ngModel]="ignoredSelectorsString()" (ngModelChange)="setIgnoredSelectorsFromString($event)" placeholder="Ej. #banner, .ads"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <div class="p-6 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end space-x-3">
          <button (click)="cancel.emit()"
            class="px-4 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 font-semibold text-sm transition-all">
            Cancelar
          </button>
          <button (click)="onSave()" [disabled]="isSubmitting()"
            class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 font-bold text-sm tracking-tight transition-all active:scale-95 shadow-lg shadow-orange-600/10">
            {{ isSubmitting() ? 'Guardando...' : 'Aplicar a ' + monitors().length + ' monitor(es)' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
    .animate-slide-in { animation: slide-in 0.25s ease-out; }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `]
})
export class GroupBulkEditComponent {
  private readonly monitorService = inject(MonitorService);
  private readonly notificationService = inject(NotificationService);

  readonly monitors = input<IMonitor[]>([]);
  readonly groupName = input<string>('');

  readonly saved = output<void>();
  readonly cancel = output<void>();

  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly notificationChannels = this.notificationService.channels;

  readonly httpMonitorCount = computed(() => this.monitors().filter(m => m.type === 'http').length);
  readonly httpNote = computed(() => `Solo aplica a monitores HTTP — ${this.httpMonitorCount()} de ${this.monitors().length} en este grupo.`);

  applyIgnoreTls = false;
  ignoreTlsValue = false;

  applyTags = false;
  tagsValue: string[] = [];

  applyNotifications = false;
  notificationIdsValue: string[] = [];

  applyIntegrity = false;
  integrityEnabledValue = false;
  integrityProfileValue: 'static' | 'dynamic' = 'static';
  integrityThresholdValue = 0.10;
  integrityIgnoredCssSelectorsValue: string[] = [];

  tagsString(): string {
    return this.tagsValue.join(', ');
  }

  setTagsFromString(val: string): void {
    this.tagsValue = val.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  ignoredSelectorsString(): string {
    return this.integrityIgnoredCssSelectorsValue.join(', ');
  }

  setIgnoredSelectorsFromString(val: string): void {
    this.integrityIgnoredCssSelectorsValue = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  toggleNotificationChannel(id: string): void {
    const ids = [...this.notificationIdsValue];
    const idx = ids.indexOf(id);
    if (idx > -1) ids.splice(idx, 1);
    else ids.push(id);
    this.notificationIdsValue = ids;
  }

  onSave(): void {
    this.formError.set(null);

    if (!this.applyIgnoreTls && !this.applyTags && !this.applyNotifications && !this.applyIntegrity) {
      this.formError.set('Marca al menos una sección para aplicar cambios.');
      return;
    }

    const patch: Partial<IMonitor> = {};
    if (this.applyIgnoreTls) patch.ignoreTls = this.ignoreTlsValue;
    if (this.applyTags) patch.tags = this.tagsValue;
    if (this.applyNotifications) patch.notificationIds = this.notificationIdsValue;
    if (this.applyIntegrity) {
      patch.integrityEnabled = this.integrityEnabledValue;
      patch.integrityProfile = this.integrityProfileValue;
      patch.integrityThreshold = this.integrityThresholdValue;
      patch.integrityIgnoredCssSelectors = this.integrityIgnoredCssSelectorsValue;
    }

    const monitorIds = this.monitors().map(m => m.id);
    if (monitorIds.length === 0) return;

    this.isSubmitting.set(true);
    this.monitorService.bulkUpdate(monitorIds, patch).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(extractApiErrorMessage(err, 'Error al aplicar los cambios masivos.'));
      }
    });
  }
}
