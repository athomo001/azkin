// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService, IMaintenanceWindow, IMaintenanceScope, MaintenanceMode } from '../../core/services/maintenance.service';
import { MonitorService } from '../../core/services/monitor.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

/**
 * Pestaña "Mantenimiento": crea/edita ventanas de silenciado de alertas (AZ-040), con alcance
 * granular (todo/grupo/monitor — mismo selector que los permisos de Viewer) y modo inmediato o
 * programado. La UI de gestión es exclusiva de Admin; el efecto (badge "En mantenimiento") lo ven
 * todos los roles a través del estado normal del monitor.
 */
@Component({
  selector: 'app-maintenance-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulario -->
      <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg h-fit">
        <div class="p-6 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">{{ isEditing() ? 'Editar ventana de mantenimiento' : 'Nueva ventana de mantenimiento' }}</h3>
            <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">Silencia alertas del alcance elegido mientras esté vigente. El monitor se muestra "En mantenimiento" en vez de caído.</p>
          </div>

          <div class="space-y-4 pt-2">
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ej. Migración de servidor DB"
                class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Descripción (opcional)</label>
              <input type="text" [(ngModel)]="form.description" placeholder="Detalle breve para el equipo"
                class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
            </div>

            @if (!isEditing()) {
              <div class="space-y-2">
                <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Modo</span>
                <div class="flex gap-2">
                  <label class="flex-1 flex items-center justify-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border cursor-pointer transition-colors"
                    [class.border-orange-500]="form.mode === 'immediate'" [class.border-zinc-850]="form.mode !== 'immediate'">
                    <input type="radio" name="mode" value="immediate" [(ngModel)]="form.mode" class="text-orange-500 focus:ring-0">
                    <span class="text-[11px] font-semibold" [class.text-orange-400]="form.mode === 'immediate'" [class.text-zinc-300]="form.mode !== 'immediate'">Inmediata</span>
                  </label>
                  <label class="flex-1 flex items-center justify-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border cursor-pointer transition-colors"
                    [class.border-orange-500]="form.mode === 'scheduled'" [class.border-zinc-850]="form.mode !== 'scheduled'">
                    <input type="radio" name="mode" value="scheduled" [(ngModel)]="form.mode" class="text-orange-500 focus:ring-0">
                    <span class="text-[11px] font-semibold" [class.text-orange-400]="form.mode === 'scheduled'" [class.text-zinc-300]="form.mode !== 'scheduled'">Programada</span>
                  </label>
                </div>
                @if (form.mode === 'immediate') {
                  <p class="text-[10px] text-zinc-500">Queda activa apenas se cree — hay que finalizarla manualmente desde el listado.</p>
                } @else {
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Inicio</label>
                      <input type="datetime-local" [(ngModel)]="form.startAtLocal"
                        class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                      <label class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Fin</label>
                      <input type="datetime-local" [(ngModel)]="form.endAtLocal"
                        class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-orange-500">
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Alcance granular (mismo patrón que permisos de Viewer) -->
            <div class="space-y-3 border-t border-zinc-850 pt-4">
              <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Alcance</span>

              <label class="flex items-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 cursor-pointer">
                <input type="checkbox" [checked]="isAllSelected()" (change)="setAllSelected($any($event.target).checked)"
                  class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                <span class="text-[11px] text-zinc-200 font-semibold">Todo el pool de monitores</span>
              </label>

              @if (!isAllSelected()) {
                <div class="space-y-2 animate-fade-in">
                  <div>
                    <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Por grupo</span>
                    @if (uniqueGroups().length === 0) {
                      <p class="text-[10px] text-zinc-600">No hay grupos de monitores definidos.</p>
                    }
                    <div class="space-y-1 max-h-28 overflow-y-auto pr-1">
                      @for (g of uniqueGroups(); track g) {
                        <label class="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
                          <input type="checkbox" [checked]="isGroupChecked(g)" (change)="toggleGroup(g)"
                            class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                          <span class="text-[11px] text-zinc-300 font-mono">{{ g }}</span>
                        </label>
                      }
                    </div>
                  </div>
                  <div>
                    <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Por monitor</span>
                    @if (monitorService.monitors().length === 0) {
                      <p class="text-[10px] text-zinc-600">No hay monitores creados todavía.</p>
                    }
                    <div class="space-y-1 max-h-28 overflow-y-auto pr-1">
                      @for (m of monitorService.monitors(); track m.id) {
                        <label class="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
                          <input type="checkbox" [checked]="isMonitorChecked(m.id)" (change)="toggleMonitor(m.id)"
                            class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                          <span class="text-[11px] text-zinc-300">{{ m.name }}</span>
                        </label>
                      }
                    </div>
                  </div>
                </div>
              }

              @if (form.scope.length === 0) {
                <p class="text-[10px] text-rose-400">Sin alcance seleccionado — no se creará ninguna ventana.</p>
              }
            </div>
          </div>
        </div>

        <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
          @if (isEditing()) {
            <button (click)="resetForm()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">Cancelar</button>
          }
          <button (click)="onSave()" class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
            {{ isEditing() ? 'Guardar cambios' : 'Crear ventana' }}
          </button>
        </div>
      </div>

      <!-- Listado -->
      <div class="col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Activas</h3>
          <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ activeWindows().length }}</span>
        </div>

        @if (activeWindows().length === 0) {
          <div class="text-center py-10 bg-zinc-900/10 border border-zinc-800/80 rounded-xl">
            <p class="text-zinc-500 text-xs font-medium">No hay ventanas de mantenimiento activas.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (w of activeWindows(); track w.id) {
              <div class="bg-zinc-900/20 border border-sky-900/50 rounded-xl p-4 flex flex-col gap-3">
                <div class="flex justify-between items-start gap-2">
                  <div>
                    <span class="text-xs font-black text-zinc-200">{{ w.name }}</span>
                    @if (w.description) { <p class="text-[10px] text-zinc-500 mt-0.5">{{ w.description }}</p> }
                  </div>
                  <span class="text-[9px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0">{{ w.mode === 'immediate' ? 'Inmediata' : 'Programada' }}</span>
                </div>
                <div class="flex flex-wrap gap-1">
                  @for (s of w.scope; track $index) {
                    <span class="text-[9px] bg-zinc-950 border border-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-medium">
                      {{ s.type === 'all' ? 'Todo' : (s.type === 'monitor' ? monitorNameById(s.value) : s.value) }}
                    </span>
                  }
                </div>
                @if (w.mode === 'scheduled') {
                  <p class="text-[10px] text-zinc-500">{{ formatRange(w.startAt, w.endAt) }}</p>
                }
                <div class="flex items-center justify-end gap-3 border-t border-zinc-900 pt-3 text-[10px] font-bold">
                  <button (click)="onEdit(w)" class="text-zinc-400 hover:text-zinc-200 transition-colors">Editar</button>
                  <button (click)="onEnd(w)" class="text-amber-500 hover:text-amber-400 transition-colors">Finalizar ahora</button>
                  <button (click)="onDelete(w)" class="text-rose-500 hover:text-rose-400 transition-colors">Eliminar</button>
                </div>
              </div>
            }
          </div>
        }

        <div class="flex items-center justify-between pt-2">
          <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Histórico</h3>
          <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ closedWindows().length }}</span>
        </div>
        @if (closedWindows().length > 0) {
          <div class="space-y-2">
            @for (w of closedWindows(); track w.id) {
              <div class="bg-zinc-900/10 border border-zinc-850 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3">
                <div>
                  <span class="text-[11px] font-bold text-zinc-400">{{ w.name }}</span>
                  <span class="text-[9px] text-zinc-600 ml-2">Cerrada {{ w.closedAt ? (w.closedAt | date: 'short') : '' }}</span>
                </div>
                <button (click)="onDelete(w)" class="text-[10px] text-rose-500 hover:text-rose-400 font-bold transition-colors">Eliminar</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `]
})
export class MaintenancePanelComponent {
  readonly maintenanceService = inject(MaintenanceService);
  readonly monitorService = inject(MonitorService);
  readonly lang = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly isEditing = signal(false);
  editingId: string | null = null;
  form = this.getEmptyForm();

  readonly activeWindows = computed(() => this.maintenanceService.windows().filter((w) => w.isActive));
  readonly closedWindows = computed(() => this.maintenanceService.windows().filter((w) => !w.isActive));

  readonly uniqueGroups = computed(() => {
    const groups = this.monitorService.monitors()
      .map((m) => m.group)
      .filter((g): g is string => !!g && g.trim().length > 0);
    return [...new Set(groups)];
  });

  constructor() {
    this.maintenanceService.loadWindows().subscribe();
  }

  private getEmptyForm() {
    return {
      name: '',
      description: '',
      scope: [] as IMaintenanceScope[],
      mode: 'immediate' as MaintenanceMode,
      startAtLocal: '',
      endAtLocal: '',
    };
  }

  isAllSelected(): boolean {
    return this.form.scope.some((s) => s.type === 'all');
  }

  setAllSelected(checked: boolean): void {
    this.form.scope = checked ? [{ type: 'all' }] : [];
  }

  isGroupChecked(group: string): boolean {
    return this.form.scope.some((s) => s.type === 'group' && s.value === group);
  }

  toggleGroup(group: string): void {
    this.form.scope = this.isGroupChecked(group)
      ? this.form.scope.filter((s) => !(s.type === 'group' && s.value === group))
      : [...this.form.scope, { type: 'group', value: group }];
  }

  isMonitorChecked(monitorId: string): boolean {
    return this.form.scope.some((s) => s.type === 'monitor' && s.value === monitorId);
  }

  toggleMonitor(monitorId: string): void {
    this.form.scope = this.isMonitorChecked(monitorId)
      ? this.form.scope.filter((s) => !(s.type === 'monitor' && s.value === monitorId))
      : [...this.form.scope, { type: 'monitor', value: monitorId }];
  }

  monitorNameById(id?: string): string {
    if (!id) return 'Todo';
    return this.monitorService.monitors().find((m) => m.id === id)?.name ?? id;
  }

  formatRange(startAt: string | null, endAt: string | null): string {
    if (!startAt || !endAt) return '';
    const fmt = (iso: string) => new Date(iso).toLocaleString();
    return `${fmt(startAt)} → ${fmt(endAt)}`;
  }

  resetForm(): void {
    this.isEditing.set(false);
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  onEdit(window: IMaintenanceWindow): void {
    this.isEditing.set(true);
    this.editingId = window.id;
    this.form = {
      name: window.name,
      description: window.description ?? '',
      scope: [...window.scope],
      mode: window.mode,
      startAtLocal: '',
      endAtLocal: '',
    };
  }

  onSave(): void {
    if (!this.form.name.trim()) {
      this.toast.show('El nombre es obligatorio.');
      return;
    }
    if (this.form.scope.length === 0) {
      this.toast.show('Debes seleccionar al menos un alcance (todo, grupo o monitor).');
      return;
    }

    if (this.isEditing() && this.editingId) {
      this.maintenanceService.update(this.editingId, {
        name: this.form.name,
        description: this.form.description || undefined,
        scope: this.form.scope,
      }).subscribe({
        next: () => {
          this.resetForm();
          this.toast.show('Ventana de mantenimiento actualizada.');
        },
        error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al actualizar la ventana.')),
      });
      return;
    }

    if (this.form.mode === 'scheduled' && (!this.form.startAtLocal || !this.form.endAtLocal)) {
      this.toast.show('Indica fecha de inicio y fin para una ventana programada.');
      return;
    }

    this.maintenanceService.create({
      name: this.form.name,
      description: this.form.description || undefined,
      scope: this.form.scope,
      mode: this.form.mode,
      startAt: this.form.mode === 'scheduled' ? new Date(this.form.startAtLocal).toISOString() : undefined,
      endAt: this.form.mode === 'scheduled' ? new Date(this.form.endAtLocal).toISOString() : undefined,
    }).subscribe({
      next: () => {
        this.resetForm();
        this.toast.show(this.form.mode === 'immediate' ? 'Mantenimiento activado.' : 'Ventana de mantenimiento programada.');
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al crear la ventana de mantenimiento.')),
    });
  }

  onEnd(window: IMaintenanceWindow): void {
    this.confirm.ask(
      '¿Finalizar mantenimiento?',
      `Las alertas de "${window.name}" volverán a activarse de inmediato.`,
      () => {
        this.maintenanceService.end(window.id).subscribe({
          next: () => this.toast.show('Ventana de mantenimiento finalizada.'),
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al finalizar la ventana.')),
        });
      },
    );
  }

  onDelete(window: IMaintenanceWindow): void {
    this.confirm.ask(
      '¿Eliminar ventana de mantenimiento?',
      `Se eliminará "${window.name}" del historial. Esta acción no se puede deshacer.`,
      () => {
        this.maintenanceService.delete(window.id).subscribe({
          next: () => this.toast.show('Ventana de mantenimiento eliminada.'),
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al eliminar la ventana.')),
        });
      },
    );
  }
}
