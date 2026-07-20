// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { FileDownloadService } from '../../core/services/file-download.service';
import { MonitorService } from '../../core/services/monitor.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

interface BackupEntry {
  id: string;
  strategy: string;
  createdAt: string;
}

interface CsvImportResult {
  createdCount: number;
  updatedCount: number;
  errors: { row: number; message: string }[];
}

interface AssetImportResult {
  createdCount: number;
  updatedCount: number;
  errors: { index: number; name?: string; message: string }[];
}

interface ImportSectionResult {
  createdCount: number;
  updatedCount: number;
  errors: { index: number; message: string }[];
}

interface BackupImportResult {
  importedCount: number;
  updatedCount: number;
  admins: ImportSectionResult;
  viewers: ImportSectionResult;
  notifications: ImportSectionResult;
  tlsConfig: { applied: boolean; skippedReason?: string };
}

interface PurgePreview {
  configured: boolean;
  keepIdentifier?: string;
  keepAdminExists: boolean;
}

interface PurgeResult {
  keptAdminIdentifier: string;
  deletedAdmins: number;
  deletedViewers: number;
  deletedMonitors: number;
  deletedNotifications: number;
  deletedApiKeys: number;
  deletedAuditLogs: number;
  deletedBackups: number;
  tlsConfigCleared: boolean;
}

/**
 * Pestaña "Respaldos": export/import JSON, importación masiva de monitores vía CSV, y
 * exportación/importación de activos (solo monitores). Extraido de settings.ts.
 */
@Component({
  selector: 'app-backups-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      <div class="p-6 space-y-6">
        <div>
          <h3 class="text-sm font-bold text-white tracking-tight">{{ lang.t('settings.backups.sectionTitle') }}</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5">{{ lang.t('settings.backups.sectionDesc') }}</p>
          <p class="text-[10px] text-amber-500/90 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            Respaldo atómico y completo: incluye monitores, canales de notificación, cuentas (admins/viewers, con su hash de contraseña) y la configuración TLS. El archivo descargado es un secreto — trátalo como una credencial, no lo compartas ni lo subas a un lugar público.
          </p>
        </div>

        <!-- Estrategia de respaldo -->
        <div class="flex gap-4 text-xs">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="backupStrategy" value="accumulate" [(ngModel)]="backupStrategy" class="text-orange-500 focus:ring-0">
            Acumular respaldos
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="backupStrategy" value="replace" [(ngModel)]="backupStrategy" class="text-orange-500 focus:ring-0">
            Reemplazar último respaldo
          </label>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button (click)="createBackup()"
            class="flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-center transition-all cursor-pointer group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-zinc-500 group-hover:text-orange-500 transition-colors mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span class="text-xs font-black text-white">{{ lang.t('settings.backups.exportBtn') }}</span>
            <span class="text-[10px] text-zinc-500 mt-1 font-medium">{{ lang.t('settings.backups.exportDesc') }}</span>
          </button>

          <div class="relative">
            <input type="file" (change)="importBackup($event)" accept=".json" id="importFile" class="hidden">
            <label for="importFile"
              class="flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-center transition-all cursor-pointer group h-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-zinc-500 group-hover:text-orange-500 transition-colors mb-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <span class="text-xs font-black text-white">{{ lang.t('settings.backups.importBtn') }}</span>
              <span class="text-[10px] text-zinc-500 mt-1 font-medium">{{ lang.t('settings.backups.importDesc') }}</span>
            </label>
          </div>
        </div>

        @if (isImportingBackup()) {
          <p class="text-[11px] text-zinc-500">Importando...</p>
        }

        @if (backupImportResult(); as result) {
          <div class="bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 text-[11px] space-y-1.5">
            <p class="text-zinc-300">Monitores: <span class="font-bold text-emerald-500">{{ result.importedCount }}</span> nuevos, <span class="font-bold text-orange-400">{{ result.updatedCount }}</span> actualizados</p>
            <p class="text-zinc-300">
              Admins: <span class="font-bold text-emerald-500">{{ result.admins.createdCount }}</span> nuevos, <span class="font-bold text-orange-400">{{ result.admins.updatedCount }}</span> actualizados
              @if (result.admins.errors.length > 0) { · <span class="font-bold text-rose-500">{{ result.admins.errors.length }} con error</span> }
            </p>
            <p class="text-zinc-300">
              Viewers: <span class="font-bold text-emerald-500">{{ result.viewers.createdCount }}</span> nuevos, <span class="font-bold text-orange-400">{{ result.viewers.updatedCount }}</span> actualizados
              @if (result.viewers.errors.length > 0) { · <span class="font-bold text-rose-500">{{ result.viewers.errors.length }} con error</span> }
            </p>
            <p class="text-zinc-300">
              Canales: <span class="font-bold text-emerald-500">{{ result.notifications.createdCount }}</span> nuevos, <span class="font-bold text-orange-400">{{ result.notifications.updatedCount }}</span> actualizados
              @if (result.notifications.errors.length > 0) { · <span class="font-bold text-rose-500">{{ result.notifications.errors.length }} con error</span> }
            </p>
            <p class="text-zinc-500">TLS: {{ result.tlsConfig.applied ? 'restaurado' : (result.tlsConfig.skippedReason || 'no aplicado') }}</p>

            @if (result.admins.errors.length > 0 || result.viewers.errors.length > 0 || result.notifications.errors.length > 0) {
              <div class="max-h-32 overflow-y-auto space-y-1 border-t border-zinc-900 pt-2">
                @for (e of result.admins.errors; track $index) {
                  <p class="text-rose-400 font-mono text-[10px]">Admin #{{ e.index + 1 }}: {{ e.message }}</p>
                }
                @for (e of result.viewers.errors; track $index) {
                  <p class="text-rose-400 font-mono text-[10px]">Viewer #{{ e.index + 1 }}: {{ e.message }}</p>
                }
                @for (e of result.notifications.errors; track $index) {
                  <p class="text-rose-400 font-mono text-[10px]">Canal #{{ e.index + 1 }}: {{ e.message }}</p>
                }
              </div>
            }
          </div>
        }

        <!-- Respaldos persistidos -->
        <div class="border-t border-zinc-850 pt-4 space-y-2">
          <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Respaldos guardados</span>
          @if (savedBackups().length === 0) {
            <p class="text-[11px] text-zinc-600">Aún no hay respaldos guardados.</p>
          } @else {
            @for (b of savedBackups(); track b.id) {
              <div class="flex items-center justify-between bg-zinc-950/60 border border-zinc-900 px-3 py-2 rounded-lg text-[11px]">
                <div>
                  <span class="text-zinc-300 font-semibold">{{ b.createdAt | date:'short' }}</span>
                  <span class="text-zinc-600 ml-2 uppercase text-[9px] font-bold">{{ b.strategy }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <button (click)="downloadBackup(b.id)" class="text-orange-500 hover:text-orange-400 font-bold">Descargar</button>
                  <button (click)="deleteBackup(b.id)" class="text-rose-500 hover:text-rose-400 font-bold">Eliminar</button>
                </div>
              </div>
            }
          }
        </div>

        <!-- Importación masiva de monitores vía CSV -->
        <div class="border-t border-zinc-850 pt-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Importar monitores (CSV)</span>
            <button (click)="downloadCsvTemplate()" class="text-[10px] text-orange-500 hover:text-orange-400 font-bold">Descargar plantilla CSV</button>
          </div>

          <div class="relative"
            (dragover)="$event.preventDefault()"
            (drop)="onCsvDrop($event)">
            <input type="file" (change)="onCsvFileSelected($event)" accept=".csv" id="csvImportFile" class="hidden">
            <label for="csvImportFile"
              class="flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-950/40 hover:bg-zinc-950 border border-dashed border-zinc-800 hover:border-orange-500/50 text-center transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-zinc-500 mb-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <span class="text-xs font-black text-white">Arrastra un CSV o haz clic para subir</span>
              <span class="text-[10px] text-zinc-500 mt-1 font-medium">Columnas: name, type, target, port, interval, retries, retryInterval, group, tags, ignoreTls</span>
              <span class="text-[10px] text-zinc-600 mt-1">Si un valor contiene comas, enciérralo entre comillas dobles (ej. "Produccion, Santiago")</span>
              <span class="text-[10px] text-zinc-700 mt-0.5">¿Tildes/ñ se ven como "Ã³"/"Ã±" en Excel? Abre el archivo con Datos → Desde texto/CSV y elige codificación UTF-8, en vez de doble clic.</span>
            </label>
          </div>

          @if (isImportingCsv()) {
            <p class="text-[11px] text-zinc-500">Importando...</p>
          }

          @if (csvImportResult(); as result) {
            <div class="bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 text-[11px] space-y-2">
              <p class="text-zinc-300">Creados: <span class="font-bold text-emerald-500">{{ result.createdCount }}</span> · Actualizados: <span class="font-bold text-orange-400">{{ result.updatedCount }}</span> · Errores: <span class="font-bold" [class.text-rose-500]="result.errors.length > 0">{{ result.errors.length }}</span></p>
              @if (result.errors.length > 0) {
                <div class="max-h-32 overflow-y-auto space-y-1 border-t border-zinc-900 pt-2">
    @for (e of result.errors; track e.row) {
                    <p class="text-rose-400 font-mono text-[10px]">Fila {{ e.row }}: {{ e.message }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Exportar/importar solo los monitores (activos), sin el resto del respaldo -->
        <div class="border-t border-zinc-850 pt-4 space-y-3">
          <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Exportar/Importar solo monitores (JSON)</span>
          <p class="text-[10px] text-zinc-600 -mt-1">
            A diferencia del respaldo completo de arriba, esto exporta únicamente el arreglo de monitores (sin canales de notificación ni otra configuración) — pensado para migrar o compartir la lista de sitios monitoreados entre instancias distintas de Azkin.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button (click)="exportAssets()"
              class="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-center transition-all cursor-pointer group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-zinc-500 group-hover:text-orange-500 transition-colors mb-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span class="text-xs font-black text-white">Exportar Activos (JSON)</span>
              <span class="text-[10px] text-zinc-500 mt-1 font-medium">Solo los monitores que tienes configurados</span>
            </button>

            <div class="relative"
              (dragover)="$event.preventDefault()"
              (drop)="onAssetsDrop($event)">
              <input type="file" (change)="onAssetsFileSelected($event)" accept=".json" id="assetsImportFile" class="hidden">
              <label for="assetsImportFile"
                class="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-center transition-all cursor-pointer group h-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-zinc-500 group-hover:text-orange-500 transition-colors mb-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span class="text-xs font-black text-white">Importar Activos (JSON)</span>
                <span class="text-[10px] text-zinc-500 mt-1 font-medium">Ignora notificaciones y datos de otra instancia</span>
              </label>
            </div>
          </div>

          @if (isImportingAssets()) {
            <p class="text-[11px] text-zinc-500">Importando...</p>
          }

          @if (assetsImportResult(); as result) {
            <div class="bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 text-[11px] space-y-2">
              <p class="text-zinc-300">Creados: <span class="font-bold text-emerald-500">{{ result.createdCount }}</span> · Actualizados: <span class="font-bold text-orange-400">{{ result.updatedCount }}</span> · Errores: <span class="font-bold" [class.text-rose-500]="result.errors.length > 0">{{ result.errors.length }}</span></p>
              @if (result.errors.length > 0) {
                <div class="max-h-32 overflow-y-auto space-y-1 border-t border-zinc-900 pt-2">
                  @for (e of result.errors; track e.index) {
                    <p class="text-rose-400 font-mono text-[10px]">Activo {{ e.index + 1 }}{{ e.name ? ' (' + e.name + ')' : '' }}: {{ e.message }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Zona de peligro: purgar toda la instancia -->
        <div class="border-t border-rose-900/40 pt-4 space-y-3">
          <span class="block text-[10px] font-bold text-rose-500 uppercase tracking-wider">Zona de peligro</span>

          @if (purgePreview(); as preview) {
            @if (!preview.configured) {
              <p class="text-[11px] text-zinc-500 bg-zinc-950/60 border border-zinc-900 rounded-lg p-3">
                No se puede purgar: no hay <code class="text-zinc-400">AZKIN_FIRST_ADMIN_EMAIL</code> ni <code class="text-zinc-400">AZKIN_FIRST_ADMIN_NAME</code> configurado en el <code class="text-zinc-400">.env</code> de esta instancia, así que no hay forma de determinar qué admin conservar.
              </p>
            } @else if (!preview.keepAdminExists) {
              <p class="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                El admin configurado en el .env ('{{ preview.keepIdentifier }}') no existe en esta instancia — la purga se cancelará automáticamente si la ejecutas, para no dejar la instancia sin administradores.
              </p>
            } @else {
              <div class="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 space-y-2 text-[11px] text-rose-300">
                <p>Elimina permanentemente TODOS los monitores, canales de notificación, API keys, historial de auditoría, respaldos guardados y configuración TLS — y todas las demás cuentas admin/viewer — conservando únicamente:</p>
                <p class="font-mono font-bold text-rose-200">{{ preview.keepIdentifier }}</p>
                <p>Si la cuenta con la que iniciaste sesión no es esa, tu propia sesión también se eliminará y se cerrará automáticamente. Esta acción no se puede deshacer.</p>
              </div>

              <div class="flex flex-col sm:flex-row gap-2">
                <input type="text" [ngModel]="purgeConfirmText()" (ngModelChange)="purgeConfirmText.set($event)" placeholder="Escribe PURGAR para habilitar el botón"
                  class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500">
                <button (click)="purgeInstance()" [disabled]="purgeConfirmText() !== 'PURGAR' || isPurging()"
                  class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-md whitespace-nowrap">
                  {{ isPurging() ? 'Purgando...' : 'Purgar instancia' }}
                </button>
              </div>
            }
          } @else {
            <p class="text-[11px] text-zinc-600">Cargando...</p>
          }
        </div>
      </div>
    </div>
  `
})
export class BackupsPanelComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly fileDownload = inject(FileDownloadService);
  private readonly monitorService = inject(MonitorService);
  private readonly authService = inject(AuthService);
  private readonly confirm = inject(ConfirmService);
  public readonly lang = inject(LanguageService);

  backupStrategy: 'accumulate' | 'replace' = 'accumulate';
  readonly savedBackups = signal<BackupEntry[]>([]);

  readonly isImportingCsv = signal(false);
  readonly csvImportResult = signal<CsvImportResult | null>(null);

  readonly isImportingAssets = signal(false);
  readonly assetsImportResult = signal<AssetImportResult | null>(null);

  readonly isImportingBackup = signal(false);
  readonly backupImportResult = signal<BackupImportResult | null>(null);

  readonly purgePreview = signal<PurgePreview | null>(null);
  readonly purgeConfirmText = signal('');
  readonly isPurging = signal(false);

  constructor() {
    this.loadBackups();
    this.loadPurgePreview();
  }

  loadBackups(): void {
    this.http.get<BackupEntry[]>('/api/v1/backup').subscribe({
      next: (data) => this.savedBackups.set(data),
      error: () => {}
    });
  }

  createBackup(): void {
    this.http.post<{ payload: unknown; deletedCount: number }>('/api/v1/backup', { strategy: this.backupStrategy }).subscribe({
      next: (res) => {
        this.fileDownload.downloadJson(res.payload, 'azkin-backup');
        this.toast.show(
          this.backupStrategy === 'replace'
            ? `Respaldo creado (se reemplazaron ${res.deletedCount} anteriores). Contiene credenciales — trátalo como un secreto.`
            : 'Respaldo creado correctamente. Contiene credenciales — trátalo como un secreto.'
        );
        this.loadBackups();
      },
      error: () => this.toast.show('Error al generar el respaldo.')
    });
  }

  downloadBackup(id: string): void {
    this.http.get(`/api/v1/backup/${id}`).subscribe({
      next: (payload) => this.fileDownload.downloadJson(payload, 'azkin-backup'),
      error: () => this.toast.show('Error al descargar el respaldo.')
    });
  }

  deleteBackup(id: string): void {
    this.confirm.ask(
      '¿Eliminar respaldo?',
      'Se eliminará permanentemente este respaldo guardado. Si no lo has descargado antes, perderás esta copia sin poder recuperarla.',
      () => {
        this.http.delete(`/api/v1/backup/${id}`).subscribe({
          next: () => {
            this.toast.show('Respaldo eliminado.');
            this.loadBackups();
          },
          error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al eliminar el respaldo.'))
        });
      }
    );
  }

  downloadCsvTemplate(): void {
    const csv = [
      // "sep=," fuerza a Excel a usar coma como separador de columnas al abrir el archivo con
      // doble clic, sin importar la configuración regional (en locales que usan coma como
      // separador decimal, Excel espera ';' y de otro modo vuelca todo en una sola columna).
      // Debe ser la primera línea del archivo para que Excel la reconozca; el backend la
      // descarta antes de parsear (no es una fila de datos).
      'sep=,',
      // Líneas que empiezan con '#' son comentarios: viajan con el archivo pero el backend las
      // ignora al importar (no son datos de un monitor). Sin comas dentro del texto (si no,
      // Excel las corta en varias columnas) y en ASCII puro (sin tildes/ñ/¿/—): son texto plano
      // que debe leerse bien en cualquier Excel, sin depender de que respete un BOM UTF-8.
      '# Plantilla de importacion de monitores - Azkin',
      '# Columnas: name | type | target | port | interval | retries | retryInterval | group | tags | ignoreTls',
      '# Valores validos para type: http | ping | port | dns | snmp | push',
      '# http = HTTP / HTTPS | ping = Ping (ICMP) | port = Port TCP | dns = DNS Resolution',
      '# snmp = SNMP Agent | push = Push (Pasivo)',
      '# target es obligatorio salvo si type=push | port es obligatorio si type=port',
      '# dns y snmp solo traen los campos basicos por CSV: configura resolver/OID despues editando el monitor en la UI',
      '# ignoreTls es opcional y solo aplica a type=http: true/false/1/0 (vacio o ausente = false,',
      '# osea SI valida el certificado TLS, igual que crear un monitor a mano). Ponlo en true solo',
      '# en las filas con certificado autofirmado/vencido/de una CA interna - ver ejemplo abajo',
      '# Si un valor necesita una coma (ej. un nombre o grupo descriptivo) encierralo entre comillas dobles - ver ejemplo abajo',
      '# Las tags se separan con ; dentro de la misma celda (ej. web;produccion)',
      '# Lineas que empiezan con # son comentarios y se ignoran al importar',
      'name,type,target,port,interval,retries,retryInterval,group,tags,ignoreTls',
      'Sitio de ejemplo,http,https://ejemplo.com,,60,0,60,General,web;produccion,',
      'Sitio con certificado interno,http,https://interno.corp,,60,0,60,General,web,true',
      // Si un valor necesita contener una coma (ej. un nombre o grupo descriptivo), enciérralo
      // entre comillas dobles — así no se interpreta como un separador de columna.
      '"Otro sitio, con coma en el nombre",http,https://ejemplo2.com,,60,0,60,"Produccion, Santiago",web,',
    ].join('\n');
    // Prefijo BOM UTF-8 para que Excel muestre correctamente tildes/ñ al abrir el archivo directo.
    this.fileDownload.downloadText(String.fromCharCode(0xfeff) + csv, 'text/csv;charset=utf-8', 'azkin-monitores-plantilla.csv');
  }

  onCsvDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processCsvFile(file);
  }

  onCsvFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.processCsvFile(file);
    event.target.value = '';
  }

  private processCsvFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const csv = String(e.target.result);
      this.isImportingCsv.set(true);
      this.csvImportResult.set(null);
      this.http.post<CsvImportResult>('/api/v1/monitors/bulk-import', { csv }).subscribe({
        next: (result) => {
          this.isImportingCsv.set(false);
          this.csvImportResult.set(result);
          this.monitorService.loadMonitors().subscribe();
          this.toast.show(`Importación completada: ${result.createdCount} creados, ${result.updatedCount} actualizados.`);
        },
        error: (err) => {
          this.isImportingCsv.set(false);
          this.toast.show(extractApiErrorMessage(err, 'Error al importar el CSV.'));
        }
      });
    };
    reader.readAsText(file);
  }

  importBackup(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      let data: unknown;
      try {
        data = JSON.parse(e.target.result);
      } catch {
        this.toast.show('El archivo seleccionado no es un JSON válido.');
        event.target.value = '';
        return;
      }

      this.isImportingBackup.set(true);
      this.backupImportResult.set(null);
      this.http.post<BackupImportResult>('/api/v1/backup/import', data).subscribe({
        next: (res) => {
          this.isImportingBackup.set(false);
          this.backupImportResult.set(res);
          const totalErrors = res.admins.errors.length + res.viewers.errors.length + res.notifications.errors.length;
          this.toast.show(
            totalErrors > 0
              ? `Importado con ${totalErrors} error(es) — revisa el detalle bajo el botón de importar.`
              : 'Importación completada correctamente.'
          );
          this.monitorService.loadMonitors().subscribe();
          event.target.value = '';
        },
        error: (err) => {
          this.isImportingBackup.set(false);
          this.toast.show(extractApiErrorMessage(err, 'Error al importar los datos en el servidor.'));
          event.target.value = '';
        }
      });
    };
    reader.readAsText(file);
  }

  exportAssets(): void {
    this.http.get<{ version: string; exportedAt: string; monitors: unknown[] }>('/api/v1/monitors/export').subscribe({
      next: (res) => {
        this.fileDownload.downloadJson(res, 'azkin-monitores');
        this.toast.show(`Exportados ${res.monitors.length} monitor(es).`);
      },
      error: (err) => this.toast.show(extractApiErrorMessage(err, 'Error al exportar los monitores.'))
    });
  }

  onAssetsDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processAssetsFile(file);
  }

  onAssetsFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.processAssetsFile(file);
    event.target.value = '';
  }

  private processAssetsFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let monitors: unknown;
      try {
        const parsed = JSON.parse(e.target.result);
        // Acepta tanto el envelope completo que produce "Exportar Activos"
        // ({ version, exportedAt, monitors }) como un arreglo de monitores suelto.
        monitors = Array.isArray(parsed) ? parsed : parsed?.monitors;
      } catch {
        this.toast.show('El archivo seleccionado no es un JSON válido.');
        return;
      }
      if (!Array.isArray(monitors) || monitors.length === 0) {
        this.toast.show('El archivo no contiene un arreglo "monitors" con al menos un activo.');
        return;
      }

      this.isImportingAssets.set(true);
      this.assetsImportResult.set(null);
      this.http.post<AssetImportResult>('/api/v1/monitors/import-assets', { monitors }).subscribe({
        next: (result) => {
          this.isImportingAssets.set(false);
          this.assetsImportResult.set(result);
          this.monitorService.loadMonitors().subscribe();
          this.toast.show(`Importación completada: ${result.createdCount} creados, ${result.updatedCount} actualizados.`);
        },
        error: (err) => {
          this.isImportingAssets.set(false);
          this.toast.show(extractApiErrorMessage(err, 'Error al importar los activos.'));
        }
      });
    };
    reader.readAsText(file);
  }

  loadPurgePreview(): void {
    this.http.get<PurgePreview>('/api/v1/backup/purge-preview').subscribe({
      next: (preview) => this.purgePreview.set(preview),
      error: () => this.purgePreview.set({ configured: false, keepAdminExists: false })
    });
  }

  purgeInstance(): void {
    if (this.purgeConfirmText() !== 'PURGAR' || this.isPurging()) return;

    this.isPurging.set(true);
    this.http.post<PurgeResult>('/api/v1/backup/purge', {}).subscribe({
      next: (res) => {
        this.toast.show(
          `Instancia purgada. Se conservó: ${res.keptAdminIdentifier}. Monitores: ${res.deletedMonitors}, canales: ${res.deletedNotifications}, cuentas: ${res.deletedAdmins + res.deletedViewers} eliminadas.`
        );
        // La purga puede haber eliminado la cuenta con la que se inició sesión (si no es la
        // cuenta conservada del .env) — se fuerza un logout y recarga completa para no dejar la
        // app en un estado inconsistente con el backend recién vaciado.
        this.authService.logout().subscribe({ complete: () => (window.location.href = '/login') });
      },
      error: (err) => {
        this.isPurging.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al purgar la instancia.'));
      }
    });
  }
}
