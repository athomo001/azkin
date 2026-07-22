// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  ReportService,
  IReportDefinition,
  ICreateReportDefinition,
  IReportScope,
  ReportFrequency,
  ReportRecipientMode,
} from '../../core/services/report.service';
import { MonitorService } from '../../core/services/monitor.service';
import { FileDownloadService } from '../../core/services/file-download.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Pestaña "Informes": crea/edita definiciones de informes periódicos de disponibilidad (AZ-045),
 * con alcance granular (mismo selector que Mantenimiento/permisos de Viewer), frecuencia
 * diaria/semanal y destinatarios (correo de alertas global o lista personalizada). Exclusiva de
 * Admin — sin punto de entrada fuera de `/settings`.
 */
@Component({
  selector: 'app-reports-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulario -->
      <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg h-fit">
        <div class="p-6 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">{{ isEditing() ? 'Editar informe' : 'Nuevo informe' }}</h3>
            <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">Consolida incidentes, downtime y uptime del alcance elegido y lo envía por correo con un PDF adjunto.</p>
          </div>

          <div class="space-y-4 pt-2">
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ej. Diario — Comercial"
                class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
            </div>

            <label class="flex items-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 cursor-pointer">
              <input type="checkbox" [(ngModel)]="form.enabled" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
              <span class="text-[11px] text-zinc-200 font-semibold">Informe habilitado</span>
            </label>

            <div class="space-y-2">
              <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Frecuencia</span>
              <div class="flex gap-2">
                <label class="flex-1 flex items-center justify-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border cursor-pointer transition-colors"
                  [class.border-orange-500]="form.frequency === 'daily'" [class.border-zinc-850]="form.frequency !== 'daily'">
                  <input type="radio" name="frequency" value="daily" [(ngModel)]="form.frequency" class="text-orange-500 focus:ring-0">
                  <span class="text-[11px] font-semibold" [class.text-orange-400]="form.frequency === 'daily'" [class.text-zinc-300]="form.frequency !== 'daily'">Diario</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border cursor-pointer transition-colors"
                  [class.border-orange-500]="form.frequency === 'weekly'" [class.border-zinc-850]="form.frequency !== 'weekly'">
                  <input type="radio" name="frequency" value="weekly" [(ngModel)]="form.frequency" class="text-orange-500 focus:ring-0">
                  <span class="text-[11px] font-semibold" [class.text-orange-400]="form.frequency === 'weekly'" [class.text-zinc-300]="form.frequency !== 'weekly'">Semanal</span>
                </label>
              </div>
              <div class="grid gap-2 pt-1" [class.grid-cols-2]="form.frequency === 'weekly'" [class.grid-cols-1]="form.frequency !== 'weekly'">
                @if (form.frequency === 'weekly') {
                  <div>
                    <label class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Día</label>
                    <select [(ngModel)]="form.dayOfWeek"
                      class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-orange-500">
                      @for (day of dayOptions; track day.value) {
                        <option [value]="day.value">{{ day.label }}</option>
                      }
                    </select>
                  </div>
                }
                <div>
                  <label class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Hora</label>
                  <select [(ngModel)]="form.hour"
                    class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-orange-500">
                    @for (h of hourOptions; track h) {
                      <option [value]="h">{{ h.toString().padStart(2, '0') }}:00</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <!-- Alcance granular (mismo patrón que Mantenimiento/permisos de Viewer) -->
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
                <p class="text-[10px] text-rose-400">Sin alcance seleccionado — el informe no incluirá ningún monitor.</p>
              }
            </div>

            <!-- Destinatarios -->
            <div class="space-y-2 border-t border-zinc-850 pt-4">
              <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destinatarios</span>
              <div class="flex gap-2">
                <label class="flex-1 flex items-center justify-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border cursor-pointer transition-colors text-center"
                  [class.border-orange-500]="form.recipientMode === 'default_alert_email'" [class.border-zinc-850]="form.recipientMode !== 'default_alert_email'">
                  <input type="radio" name="recipientMode" value="default_alert_email" [(ngModel)]="form.recipientMode" class="text-orange-500 focus:ring-0">
                  <span class="text-[11px] font-semibold" [class.text-orange-400]="form.recipientMode === 'default_alert_email'" [class.text-zinc-300]="form.recipientMode !== 'default_alert_email'">Correo de alertas global</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border cursor-pointer transition-colors text-center"
                  [class.border-orange-500]="form.recipientMode === 'custom_list'" [class.border-zinc-850]="form.recipientMode !== 'custom_list'">
                  <input type="radio" name="recipientMode" value="custom_list" [(ngModel)]="form.recipientMode" class="text-orange-500 focus:ring-0">
                  <span class="text-[11px] font-semibold" [class.text-orange-400]="form.recipientMode === 'custom_list'" [class.text-zinc-300]="form.recipientMode !== 'custom_list'">Lista personalizada</span>
                </label>
              </div>
              @if (form.recipientMode === 'default_alert_email') {
                <p class="text-[10px] text-zinc-500">Usa el destinatario configurado en "SMTP de Aplicación" (pestaña TLS/Sistema).</p>
              } @else {
                <input type="text" [(ngModel)]="form.recipientEmailsText" placeholder="correo1@empresa.com, correo2@empresa.com"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                <p class="text-[10px] text-zinc-500">Separa varios correos con comas.</p>
              }
            </div>
          </div>
        </div>

        <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
          @if (isEditing()) {
            <button (click)="resetForm()" [disabled]="formBusy()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
          }
          <button (click)="onSaveAndSendNow()" [disabled]="formBusy()"
            class="px-3 py-1.5 rounded-lg border border-sky-800/60 text-sky-400 hover:bg-sky-950/40 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {{ sendingNow() ? 'Enviando…' : 'Enviar ahora' }}
          </button>
          <button (click)="onSave()" [disabled]="formBusy()"
            class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {{ saving() ? 'Guardando…' : (isEditing() ? 'Guardar cambios' : 'Crear informe') }}
          </button>
        </div>
      </div>

      <!-- Listado -->
      <div class="col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Informes configurados</h3>
          <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ reportService.definitions().length }}</span>
        </div>

        @if (reportService.definitions().length === 0) {
          <div class="text-center py-10 bg-zinc-900/10 border border-zinc-800/80 rounded-xl">
            <p class="text-zinc-500 text-xs font-medium">No hay informes configurados todavía.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (d of reportService.definitions(); track d.id) {
              <div class="bg-zinc-900/20 border rounded-xl p-4 flex flex-col gap-3" [class.border-sky-900/50]="d.enabled" [class.border-zinc-850]="!d.enabled">
                <div class="flex justify-between items-start gap-2">
                  <span class="text-xs font-black text-zinc-200">{{ d.name }}</span>
                  <span class="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0"
                    [class.bg-sky-500/10]="d.enabled" [class.border-sky-500/20]="d.enabled" [class.text-sky-400]="d.enabled" [class.border]="true"
                    [class.bg-zinc-900]="!d.enabled" [class.border-zinc-800]="!d.enabled" [class.text-zinc-500]="!d.enabled">
                    {{ d.enabled ? 'Activo' : 'Deshabilitado' }}
                  </span>
                </div>
                <p class="text-[10px] text-zinc-500">{{ formatSchedule(d) }}</p>
                <div class="flex flex-wrap gap-1">
                  @for (s of d.scope; track $index) {
                    <span class="text-[9px] bg-zinc-950 border border-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-medium">
                      {{ s.type === 'all' ? 'Todo' : (s.type === 'monitor' ? monitorNameById(s.value) : s.value) }}
                    </span>
                  }
                </div>
                <p class="text-[10px] text-zinc-500 truncate" [title]="recipientSummary(d)">{{ recipientSummary(d) }}</p>
                @if (d.lastSentAt) {
                  <p class="text-[9px] text-zinc-600">Último envío: {{ d.lastSentAt | date: 'short' }}</p>
                }
                <div class="flex items-center justify-end gap-3 border-t border-zinc-900 pt-3 text-[10px] font-bold flex-wrap">
                  <button (click)="onEdit(d)" class="text-zinc-400 hover:text-zinc-200 transition-colors">Editar</button>
                  <button (click)="onSendTest(d)" class="text-sky-500 hover:text-sky-400 transition-colors">Enviar prueba</button>
                  <button (click)="onDownload(d)" class="text-amber-500 hover:text-amber-400 transition-colors">Descargar PDF</button>
                  <button (click)="onDelete(d)" class="text-rose-500 hover:text-rose-400 transition-colors">Eliminar</button>
                </div>
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
export class ReportsPanelComponent {
  readonly reportService = inject(ReportService);
  readonly monitorService = inject(MonitorService);
  private readonly fileDownload = inject(FileDownloadService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly dayOptions = DAY_LABELS.map((label, value) => ({ value, label }));
  readonly hourOptions = Array.from({ length: 24 }, (_, i) => i);

  readonly isEditing = signal(false);
  readonly saving = signal(false);
  readonly sendingNow = signal(false);
  readonly formBusy = computed(() => this.saving() || this.sendingNow());
  editingId: string | null = null;
  form = this.getEmptyForm();

  readonly uniqueGroups = computed(() => {
    const groups = this.monitorService.monitors()
      .map((m) => m.group)
      .filter((g): g is string => !!g && g.trim().length > 0);
    return [...new Set(groups)];
  });

  constructor() {
    this.reportService.loadDefinitions().subscribe();
  }

  private getEmptyForm() {
    return {
      name: '',
      enabled: true,
      frequency: 'daily' as ReportFrequency,
      hour: 8,
      dayOfWeek: 1,
      scope: [] as IReportScope[],
      recipientMode: 'default_alert_email' as ReportRecipientMode,
      recipientEmailsText: '',
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

  formatSchedule(d: IReportDefinition): string {
    const time = `${d.hour.toString().padStart(2, '0')}:00`;
    if (d.frequency === 'daily') return `Diario a las ${time}`;
    return `Semanal, ${DAY_LABELS[d.dayOfWeek ?? 0]} a las ${time}`;
  }

  recipientSummary(d: IReportDefinition): string {
    if (d.recipientMode === 'default_alert_email') return 'Correo de alertas global';
    return d.recipientEmails.length > 0 ? d.recipientEmails.join(', ') : 'Sin destinatarios configurados';
  }

  private parseEmails(text: string): string[] {
    return text.split(',').map((e) => e.trim()).filter((e) => e.length > 0);
  }

  resetForm(): void {
    this.isEditing.set(false);
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  onEdit(definition: IReportDefinition): void {
    this.isEditing.set(true);
    this.editingId = definition.id;
    this.form = {
      name: definition.name,
      enabled: definition.enabled,
      frequency: definition.frequency,
      hour: definition.hour,
      dayOfWeek: definition.dayOfWeek ?? 1,
      scope: [...definition.scope],
      recipientMode: definition.recipientMode,
      recipientEmailsText: definition.recipientEmails.join(', '),
    };
  }

  /** Valida el formulario y arma el payload, o muestra el toast de error y devuelve null. */
  private buildPayloadOrNull(): ICreateReportDefinition | null {
    if (!this.form.name.trim()) {
      this.toast.show('El nombre es obligatorio.');
      return null;
    }
    if (this.form.scope.length === 0) {
      this.toast.show('Debes seleccionar al menos un alcance (todo, grupo o monitor).');
      return null;
    }

    const recipientEmails = this.parseEmails(this.form.recipientEmailsText);
    if (this.form.recipientMode === 'custom_list') {
      if (recipientEmails.length === 0) {
        this.toast.show('Indica al menos un correo en la lista personalizada.');
        return null;
      }
      const invalid = recipientEmails.find((e) => !EMAIL_RE.test(e));
      if (invalid) {
        this.toast.show(`Correo inválido: ${invalid}`);
        return null;
      }
    }

    return {
      name: this.form.name,
      enabled: this.form.enabled,
      frequency: this.form.frequency,
      scope: this.form.scope,
      hour: this.form.hour,
      dayOfWeek: this.form.frequency === 'weekly' ? this.form.dayOfWeek : undefined,
      recipientMode: this.form.recipientMode,
      recipientEmails,
    };
  }

  private persist(payload: ICreateReportDefinition): Observable<IReportDefinition> {
    return this.isEditing() && this.editingId
      ? this.reportService.update(this.editingId, payload)
      : this.reportService.create(payload);
  }

  onSave(): void {
    if (this.formBusy()) return;
    const payload = this.buildPayloadOrNull();
    if (!payload) return;
    const wasEditing = this.isEditing();

    this.saving.set(true);
    this.persist(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.toast.show(wasEditing ? 'Informe actualizado.' : 'Informe creado.');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al guardar el informe.'));
      },
    });
  }

  /** "Enviar ahora": guarda la definición y de inmediato dispara un envío de prueba del periodo
   * vigente (últimas 24h si es diario, últimos 7 días si es semanal) — sin esperar a la hora
   * programada. A diferencia de `onSave()`, deja el formulario en modo edición sobre el informe
   * recién guardado en vez de resetearlo a uno nuevo: si el usuario repite la acción mientras el
   * envío todavía está en curso, actualiza el mismo informe en vez de crear uno duplicado. */
  onSaveAndSendNow(): void {
    if (this.formBusy()) return;
    const payload = this.buildPayloadOrNull();
    if (!payload) return;

    this.sendingNow.set(true);
    this.persist(payload).subscribe({
      next: (definition) => {
        this.onEdit(definition);
        this.reportService.sendTest(definition.id).subscribe({
          next: () => {
            this.sendingNow.set(false);
            this.toast.show(`Informe guardado y enviado: "${definition.name}".`);
          },
          error: (err) => {
            this.sendingNow.set(false);
            this.toast.show(extractApiErrorMessage(err, 'El informe se guardó, pero falló el envío.'));
          },
        });
      },
      error: (err) => {
        this.sendingNow.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al guardar el informe.'));
      },
    });
  }

  onSendTest(definition: IReportDefinition): void {
    this.reportService.sendTest(definition.id).subscribe({
      next: () => this.toast.show(`Correo de prueba enviado para "${definition.name}".`),
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al enviar el correo de prueba.')),
    });
  }

  onDownload(definition: IReportDefinition): void {
    this.reportService.downloadPdf(definition.id).subscribe({
      next: (blob) => this.fileDownload.downloadFileBlob(blob, `informe-${definition.id}.pdf`),
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al descargar el PDF.')),
    });
  }

  onDelete(definition: IReportDefinition): void {
    this.confirm.ask(
      '¿Eliminar informe?',
      `Se eliminará "${definition.name}" y dejará de enviarse. Esta acción no se puede deshacer.`,
      () => {
        this.reportService.delete(definition.id).subscribe({
          next: () => this.toast.show('Informe eliminado.'),
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al eliminar el informe.')),
        });
      },
    );
  }
}
