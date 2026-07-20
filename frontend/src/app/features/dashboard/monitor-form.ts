// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitorService, IMonitor } from '../../core/services/monitor.service';
import { NotificationService } from '../../core/services/notification.service';
import { LanguageService } from '../../core/services/language.service';

type MonitorType = 'http' | 'ping' | 'port' | 'dns' | 'push' | 'snmp';

/**
 * Slide-over de creación/edición de monitor. Extraido de dashboard.ts (AZ-016).
 *
 * `monitor` es `null` para creación, o el monitor a editar. El componente construye su propio
 * `formModel` a partir de ese input en `ngOnInit` (se instancia de nuevo cada vez que el shell
 * lo muestra, vía `@if (showForm())`, así que no necesita reaccionar a cambios posteriores del
 * input). Al guardar exitosamente emite `saved` con el monitor resultante — el shell decide qué
 * hacer después (reseleccionar, recargar incidentes, cerrar el panel), porque esa parte toca
 * estado de selección/chart que permanece en el shell (ver nota "Fuera de alcance" en AZ-016).
 */
@Component({
  selector: 'app-monitor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end overflow-hidden">
      <!-- Backdrop -->
      <div (click)="cancel.emit()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

      <!-- Panel Formulario -->
      <div class="relative w-full max-w-xl bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl flex flex-col justify-between animate-slide-in">
        <!-- Header -->
        <div class="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div>
            <h3 class="text-lg font-black text-orange-500">{{ isEditing() ? lang.t('monitor.modal.editTitle') : lang.t('monitor.modal.addTitle') }}</h3>
            <p class="text-xs text-zinc-500 mt-1">{{ lang.t('monitor.modal.subtitle') }}</p>
          </div>
          <button (click)="cancel.emit()" aria-label="Cerrar formulario" title="Cerrar formulario" class="text-zinc-500 hover:text-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Banner de Error de Formulario -->
          @if (formError()) {
            <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2 animate-fade-in mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{{ formError() }}</span>
            </div>
          }

          <!-- Datos Básicos -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.sec1') }}</h4>

            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.name') }}</label>
                <input type="text" [(ngModel)]="formModel.name" placeholder="Ej. Servidor Web Principal" required
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.type') }}</label>
                <select [(ngModel)]="formModel.type"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                  <option value="http">HTTP / HTTPS</option>
                  <option value="ping">Ping (ICMP)</option>
                  <option value="port">Port TCP</option>
                  <option value="dns">DNS Resolution</option>
                  <option value="snmp">SNMP Agent</option>
                  <option value="push">{{ lang.t('monitor.modal.pushPassive') }}</option>
                </select>
              </div>
              @if (formModel.type !== 'push') {
                <div>
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.target') }}</label>
                  <input type="text" [(ngModel)]="formModel.target" placeholder="Ej. www.google.com o 8.8.8.8" required
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
                </div>
              }
            </div>

            @if (formModel.type === 'http' || formModel.type === 'ping' || formModel.type === 'port') {
              <div class="animate-fade-in">
                <div class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="formModel.sameHostAsAzkin" id="sameHostAsAzkin"
                    class="rounded border-zinc-800 text-orange-500 focus:ring-0 cursor-pointer">
                  <label for="sameHostAsAzkin" class="text-xs text-zinc-300 font-bold cursor-pointer select-none">
                    {{ lang.t('monitor.modal.sameHostLabel') }}
                  </label>
                </div>
                @if (formModel.sameHostAsAzkin) {
                  <p class="mt-2 text-[11px] leading-relaxed text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-2 animate-fade-in">
                    {{ lang.t('monitor.modal.sameHostHint') }}
                  </p>
                }
              </div>
            }
          </div>

          <!-- Configuración del Checker -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.sec2') }}</h4>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.interval') }}</label>
                <input type="number" [(ngModel)]="formModel.interval" min="20" required
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.retries') }}</label>
                <input type="number" [(ngModel)]="formModel.retries" min="0" required
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.retryInterval') }}</label>
                <input type="number" [(ngModel)]="formModel.retryInterval" min="20" required
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
              </div>
            </div>
          </div>

          <!-- Campos de SNMP -->
          @if (formModel.type === 'snmp') {
            <div class="space-y-4 animate-fade-in">
              <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.snmpSec') }}</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpVersion') }}</label>
                  <select [(ngModel)]="formModel.snmpVersion"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                    <option value="v1">SNMP v1</option>
                    <option value="v2c">SNMP v2c</option>
                    <option value="v3">SNMP v3</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpPort') }}</label>
                  <input type="number" [(ngModel)]="formModel.snmpPort" placeholder="161"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                </div>
                <div class="col-span-2">
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpOid') }}</label>
                  <input type="text" [(ngModel)]="formModel.snmpOid" placeholder="Ej. 1.3.6.1.2.1.1.5.0"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white font-mono">
                </div>

                @if (formModel.snmpVersion !== 'v3') {
                  <div class="col-span-2 animate-fade-in">
                    <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpCommunity') }}</label>
                    <input type="text" [(ngModel)]="formModel.snmpCommunity" placeholder="public"
                      class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                  </div>
                }

                <!-- Parámetros SNMP v3 -->
                @if (formModel.snmpVersion === 'v3') {
                  <div class="col-span-2 grid grid-cols-2 gap-4 border border-zinc-800 p-4 rounded-xl bg-zinc-950/45 animate-fade-in">
                    <div class="col-span-2">
                      <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpUser') }}</label>
                      <input type="text" [(ngModel)]="formModel.snmpV3Username" placeholder="Username"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-white">
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpAuthProto') }}</label>
                      <select [(ngModel)]="formModel.snmpV3AuthProtocol"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-white">
                        <option value="md5">MD5</option>
                        <option value="sha">SHA</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpAuthKey') }}</label>
                      <input type="password" [(ngModel)]="formModel.snmpV3AuthKey" placeholder="••••••••"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-white">
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpPrivProto') }}</label>
                      <select [(ngModel)]="formModel.snmpV3PrivProtocol"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-white">
                        <option value="des">DES</option>
                        <option value="aes">AES</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.snmpPrivKey') }}</label>
                      <input type="password" [(ngModel)]="formModel.snmpV3PrivKey" placeholder="••••••••"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-white">
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Organización -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.sec3') }}</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.group') }}</label>
                <input type="text" [(ngModel)]="formModel.group" list="groups-datalist" placeholder="Ej. Bases de Datos"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
                <datalist id="groups-datalist">
                  @for (g of uniqueGroups(); track g) {
                    <option [value]="g"></option>
                  }
                </datalist>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.tags') }}</label>
                <input type="text" [ngModel]="tagsString()" (ngModelChange)="setTagsFromString($event)" placeholder="Ej. aws, core, api"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
              </div>
            </div>
          </div>

          <!-- Canales de Alerta -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.sec4') }}</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto border border-zinc-800 p-3 rounded-xl bg-zinc-950/20">
              @if (notificationChannels().length === 0) {
                <p class="text-xs text-zinc-500 font-semibold p-2">{{ lang.t('monitor.modal.noChannels') }}</p>
              } @else {
                @for (ch of notificationChannels(); track ch.id) {
                  <div class="flex items-center gap-3 p-1.5 hover:bg-zinc-900/60 rounded transition-colors">
                    <input type="checkbox"
                      [checked]="formModel.notificationIds.includes(ch.id)"
                      (change)="toggleNotificationChannel(ch.id)"
                      [id]="'ch-' + ch.id"
                      class="rounded border-zinc-850 text-orange-500 focus:ring-0 cursor-pointer">
                    <label [for]="'ch-' + ch.id" class="text-xs text-zinc-300 font-bold cursor-pointer flex-1 flex items-center justify-between">
                      <span>{{ ch.name }}</span>
                      <span class="text-[9px] uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">{{ ch.type }}</span>
                    </label>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Opciones avanzadas de puerto -->
          @if (formModel.type === 'port') {
            <div class="space-y-4 animate-fade-in">
              <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.portSec') }}</h4>
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.portNum') }}</label>
                <input type="number" [(ngModel)]="formModel.port" placeholder="Ej. 80 o 3306" required
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
              </div>
            </div>
          }

          <!-- Opciones avanzadas de DNS -->
          @if (formModel.type === 'dns') {
            <div class="space-y-4 animate-fade-in">
              <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.dnsSec') }}</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.dnsResolver') }}</label>
                  <input type="text" [(ngModel)]="formModel.dnsResolver" placeholder="Ej. 8.8.8.8 o 1.1.1.1"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.dnsRecord') }}</label>
                  <select [(ngModel)]="formModel.dnsRecordType"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                    <option value="A">A (IPv4)</option>
                    <option value="AAAA">AAAA (IPv6)</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX</option>
                    <option value="TXT">TXT</option>
                  </select>
                </div>
              </div>
            </div>
          }

          <!-- Defacement / Integridad Visual y Estructural -->
          @if (formModel.type === 'http') {
            <div class="space-y-4">
              <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">{{ lang.t('monitor.modal.sec5') }}</h4>
              <div class="space-y-4">
                <div class="flex items-center gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <input type="checkbox" [(ngModel)]="formModel.integrityEnabled" id="integrityEnabled" class="rounded border-zinc-800 text-orange-500 focus:ring-0">
                  <label for="integrityEnabled" class="text-xs text-zinc-300 font-semibold cursor-pointer">{{ lang.t('monitor.modal.integrityCheck') }}</label>
                </div>

                @if (formModel.integrityEnabled) {
                  <div class="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.integrityProfile') }}</label>
                      <select [(ngModel)]="formModel.integrityProfile"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                        <option value="static">Estático (Static)</option>
                        <option value="dynamic">Dinámico (Dynamic)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.integrityThreshold') }}</label>
                      <input type="number" [(ngModel)]="formModel.integrityThreshold" step="0.01" min="0" max="1"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('monitor.modal.cssSelectors') }}</label>
                      <input type="text" [ngModel]="ignoredSelectorsString()" (ngModelChange)="setIgnoredSelectorsFromString($event)" placeholder="Ej. #banner, .ads"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Footer (Acciones) -->
        <div class="p-6 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end space-x-3">
          <button (click)="cancel.emit()"
            class="px-4 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 font-semibold text-sm transition-all">
            {{ lang.t('common.cancel') }}
          </button>
          <button (click)="onSave()" [disabled]="isSubmitting()"
            class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 font-bold text-sm tracking-tight transition-all active:scale-95 shadow-lg shadow-orange-600/10">
            {{ isSubmitting() ? lang.t('monitor.modal.saving') : lang.t('monitor.modal.saveBtn') }}
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
export class MonitorFormComponent implements OnInit {
  private readonly monitorService = inject(MonitorService);
  private readonly notificationService = inject(NotificationService);
  public readonly lang = inject(LanguageService);

  /** `null` = modo creación; un monitor = modo edición. */
  readonly monitor = input<IMonitor | null>(null);

  readonly saved = output<IMonitor>();
  readonly cancel = output<void>();

  readonly isEditing = computed(() => this.monitor() !== null);
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly notificationChannels = this.notificationService.channels;
  readonly uniqueGroups = computed(() => {
    const list = this.monitorService.monitors().map(m => m.group).filter(g => g);
    return Array.from(new Set(list)) as string[];
  });

  formModel = this.getEmptyForm();

  ngOnInit(): void {
    const monitor = this.monitor();
    this.formModel = monitor ? this.buildFormFromMonitor(monitor) : this.getEmptyForm();
  }

  private getEmptyForm() {
    return {
      name: '',
      type: 'http' as MonitorType,
      target: '',
      port: 80 as number | undefined,
      interval: 60,
      retries: 0,
      retryInterval: 60,
      group: '',
      tags: [] as string[],
      keyword: '',
      keywordMethod: 'presence' as 'presence' | 'absence',
      dnsResolver: '',
      dnsRecordType: 'A' as 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT',

      // SNMP Fields
      snmpVersion: 'v2c' as 'v1' | 'v2c' | 'v3',
      snmpCommunity: 'public',
      snmpPort: 161,
      snmpOid: '1.3.6.1.2.1.1.5.0',
      snmpV3Username: '',
      snmpV3AuthProtocol: 'md5' as 'md5' | 'sha',
      snmpV3AuthKey: '',
      snmpV3PrivProtocol: 'des' as 'des' | 'aes',
      snmpV3PrivKey: '',

      ignoreTls: false,
      sameHostAsAzkin: false,
      userAgent: '',
      integrityEnabled: false,
      integrityProfile: 'static' as 'static' | 'dynamic',
      integrityThreshold: 0.10,
      integrityIgnoredCssSelectors: [] as string[],
      notificationIds: [] as string[]
    };
  }

  private buildFormFromMonitor(monitor: IMonitor): ReturnType<MonitorFormComponent['getEmptyForm']> {
    return {
      name: monitor.name,
      type: monitor.type,
      target: monitor.target || '',
      port: monitor.port,
      interval: monitor.interval,
      retries: monitor.retries || 0,
      retryInterval: 60,
      group: monitor.group || '',
      tags: monitor.tags || [],
      keyword: (monitor as any).keyword || '',
      keywordMethod: (monitor as any).keywordMethod || 'presence',
      dnsResolver: (monitor as any).dnsResolver || '',
      dnsRecordType: (monitor as any).dnsRecordType || 'A',

      // SNMP Fields mappings
      snmpVersion: monitor.snmpVersion || 'v2c',
      snmpCommunity: monitor.snmpCommunity || 'public',
      snmpPort: monitor.snmpPort || 161,
      snmpOid: monitor.snmpOid || '1.3.6.1.2.1.1.5.0',
      snmpV3Username: monitor.snmpV3Username || '',
      snmpV3AuthProtocol: monitor.snmpV3AuthProtocol || 'md5',
      snmpV3AuthKey: monitor.snmpV3AuthKey || '',
      snmpV3PrivProtocol: monitor.snmpV3PrivProtocol || 'des',
      snmpV3PrivKey: monitor.snmpV3PrivKey || '',

      ignoreTls: (monitor as any).ignoreTls || false,
      sameHostAsAzkin: (monitor as any).sameHostAsAzkin || false,
      userAgent: (monitor as any).userAgent || '',
      integrityEnabled: (monitor as any).integrityEnabled || false,
      integrityProfile: (monitor as any).integrityProfile || 'static',
      integrityThreshold: (monitor as any).integrityThreshold || 0.10,
      integrityIgnoredCssSelectors: (monitor as any).integrityIgnoredCssSelectors || [],
      notificationIds: monitor.notificationIds || []
    };
  }

  tagsString(): string {
    return this.formModel.tags.join(', ');
  }

  setTagsFromString(val: string): void {
    this.formModel.tags = val.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  ignoredSelectorsString(): string {
    return this.formModel.integrityIgnoredCssSelectors.join(', ');
  }

  setIgnoredSelectorsFromString(val: string): void {
    this.formModel.integrityIgnoredCssSelectors = val.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  toggleNotificationChannel(id: string): void {
    const ids = [...this.formModel.notificationIds];
    const idx = ids.indexOf(id);
    if (idx > -1) {
      ids.splice(idx, 1);
    } else {
      ids.push(id);
    }
    this.formModel.notificationIds = ids;
  }

  onSave(): void {
    if (!this.formModel.name.trim()) return;

    this.isSubmitting.set(true);
    this.formError.set(null);

    const type = this.formModel.type;
    let targetUrl = this.formModel.target?.trim();

    if (type !== 'push' && !targetUrl) {
      this.formError.set('Por favor, ingresa el destino/host.');
      this.isSubmitting.set(false);
      return;
    }

    // Validación inteligente de Target según el tipo
    if (type === 'http') {
      if (targetUrl && !targetUrl.toLowerCase().startsWith('http://') && !targetUrl.toLowerCase().startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
        this.formModel.target = targetUrl;
      }
      const hasProto = targetUrl.toLowerCase().startsWith('http://') || targetUrl.toLowerCase().startsWith('https://');
      if (!hasProto) {
        this.formError.set('Para monitores HTTP/HTTPS, el destino debe iniciar con http:// o https://');
        this.isSubmitting.set(false);
        return;
      }
    } else if (type === 'ping' || type === 'port' || type === 'dns' || type === 'snmp') {
      const hasProto = targetUrl.toLowerCase().includes('http://') || targetUrl.toLowerCase().includes('https://');
      const hasPath = targetUrl.includes('/');
      if (hasProto || hasPath) {
        this.formError.set('Para este tipo de monitor (Ping/Puerto/DNS/SNMP), el destino debe ser un host o IP puro (sin http://, https:// ni rutas).');
        this.isSubmitting.set(false);
        return;
      }
    }

    const payload: Partial<IMonitor> = {
      name: this.formModel.name,
      type: this.formModel.type,
      target: this.formModel.type !== 'push' ? targetUrl : undefined,
      port: this.formModel.type === 'port' ? this.formModel.port : undefined,
      interval: this.formModel.interval,
      retries: this.formModel.retries,
      group: this.formModel.group?.trim() || null as any,
      tags: this.formModel.tags,
      isActive: true,
      notificationIds: this.formModel.notificationIds,
      sameHostAsAzkin: ['http', 'ping', 'port'].includes(this.formModel.type) ? this.formModel.sameHostAsAzkin : undefined
    };

    if (this.formModel.type === 'http') {
      Object.assign(payload, {
        keyword: this.formModel.keyword?.trim() || undefined,
        keywordMethod: this.formModel.keyword?.trim() ? this.formModel.keywordMethod : undefined,
        ignoreTls: this.formModel.ignoreTls,
        userAgent: this.formModel.userAgent?.trim() || undefined,
        integrityEnabled: this.formModel.integrityEnabled,
        integrityProfile: this.formModel.integrityEnabled ? this.formModel.integrityProfile : undefined,
        integrityThreshold: this.formModel.integrityEnabled ? this.formModel.integrityThreshold : undefined,
        integrityIgnoredCssSelectors: this.formModel.integrityEnabled ? this.formModel.integrityIgnoredCssSelectors : undefined
      });
    } else if (this.formModel.type === 'dns') {
      Object.assign(payload, {
        dnsResolver: this.formModel.dnsResolver?.trim() || undefined,
        dnsRecordType: this.formModel.dnsRecordType
      });
    } else if (this.formModel.type === 'snmp') {
      Object.assign(payload, {
        snmpVersion: this.formModel.snmpVersion,
        snmpCommunity: this.formModel.snmpVersion !== 'v3' ? this.formModel.snmpCommunity : undefined,
        snmpPort: this.formModel.snmpPort,
        snmpOid: this.formModel.snmpOid,
        snmpV3Username: this.formModel.snmpVersion === 'v3' ? this.formModel.snmpV3Username : undefined,
        snmpV3AuthProtocol: this.formModel.snmpVersion === 'v3' ? this.formModel.snmpV3AuthProtocol : undefined,
        snmpV3AuthKey: this.formModel.snmpVersion === 'v3' ? this.formModel.snmpV3AuthKey : undefined,
        snmpV3PrivProtocol: this.formModel.snmpVersion === 'v3' ? this.formModel.snmpV3PrivProtocol : undefined,
        snmpV3PrivKey: this.formModel.snmpVersion === 'v3' ? this.formModel.snmpV3PrivKey : undefined,
      });
    }

    const currentMonitor = this.monitor();
    if (this.isEditing() && currentMonitor) {
      this.monitorService.update(currentMonitor.id, payload).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.saved.emit(updated);
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.monitorService.create(payload).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.saved.emit(created);
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }
}
