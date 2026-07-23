// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationService } from '../../core/services/notification.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';

interface TlsStatus {
  configured: boolean;
  port?: number;
  httpRedirect?: boolean;
  validTo?: string;
  listenerActive: boolean;
}

interface SmtpStatus {
  configured: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
}

interface AppSmtpChannel {
  notificationChannelId: string | null;
  channelName: string | null;
}

interface MonitoringEngineDefaults {
  degradedLatencyMs: number;
  acceleratedIntervalSeconds: number;
}

interface MonitoringEngineSettings {
  degradedLatencyMs: number | null;
  acceleratedIntervalSeconds: number | null;
  defaults: MonitoringEngineDefaults;
}

/**
 * Pestaña "TLS / Sistema": configuracion de certificado SSL/TLS + estado/prueba del
 * SMTP de aplicacion, deliberadamente separado del SMTP por canal de alerta.
 * Extraido de settings.ts.
 */
@Component({
  selector: 'app-tls-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      <div class="p-6 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-white tracking-tight">Certificado SSL/TLS</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5">
            Configura el listener HTTPS nativo del backend. La clave privada se cifra en reposo.
          </p>
        </div>

        <div class="bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 flex items-center justify-between gap-3">
          <p class="text-[10px] text-zinc-500">
            El cifrado en reposo se deriva automáticamente de <code class="font-mono text-zinc-400">AZKIN_JWT_SECRET</code> — no requiere ningún paso adicional. Opcional: si preferís una clave independiente, podés fijar <code class="font-mono text-zinc-400">AZKIN_TLS_ENCRYPTION_KEY</code> a mano en el <code class="font-mono text-zinc-400">.env</code> del servidor.
          </p>
          <button (click)="generateTlsEncryptionKey()"
            class="shrink-0 text-[10px] text-orange-500 hover:text-orange-400 font-bold px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-orange-500/40 transition-colors uppercase tracking-wider">
            Generar clave independiente
          </button>
        </div>

        @if (tlsStatus()?.configured) {
          <div class="bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 text-[11px] space-y-1">
            <p class="text-zinc-300">Puerto activo: <span class="font-mono font-bold">{{ tlsStatus()?.port }}</span></p>
            <p class="text-zinc-300">Vence: <span class="font-mono">{{ tlsStatus()?.validTo }}</span></p>
            <p class="text-zinc-500">Listener HTTPS: {{ tlsStatus()?.listenerActive ? 'activo' : 'inactivo' }}</p>
          </div>
        }

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Certificado (PEM)</label>
            <input type="file" (change)="onTlsFileSelected($event, 'certPem')" accept=".pem,.crt,.cer,.txt" id="tlsCertFile" class="hidden">
            <label for="tlsCertFile" class="text-[9px] text-orange-500 hover:text-orange-400 font-bold cursor-pointer uppercase tracking-wider">Subir archivo</label>
          </div>
          <textarea rows="4" [(ngModel)]="tlsForm.certPem" placeholder="-----BEGIN CERTIFICATE-----"
            class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-orange-500"></textarea>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Clave privada (PEM)</label>
            <input type="file" (change)="onTlsFileSelected($event, 'keyPem')" accept=".pem,.key,.txt" id="tlsKeyFile" class="hidden">
            <label for="tlsKeyFile" class="text-[9px] text-orange-500 hover:text-orange-400 font-bold cursor-pointer uppercase tracking-wider">Subir archivo</label>
          </div>
          <textarea rows="4" [(ngModel)]="tlsForm.keyPem" placeholder="-----BEGIN PRIVATE KEY-----"
            class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-orange-500"></textarea>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cadena intermedia (opcional)</label>
            <input type="file" (change)="onTlsFileSelected($event, 'chainPem')" accept=".pem,.crt,.cer,.txt" id="tlsChainFile" class="hidden">
            <label for="tlsChainFile" class="text-[9px] text-orange-500 hover:text-orange-400 font-bold cursor-pointer uppercase tracking-wider">Subir archivo</label>
          </div>
          <textarea rows="3" [(ngModel)]="tlsForm.chainPem" placeholder="-----BEGIN CERTIFICATE-----"
            class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-orange-500"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Puerto HTTPS</label>
            <input type="number" [(ngModel)]="tlsForm.port" placeholder="443"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500">
          </div>
          <div class="flex items-center gap-2 pt-5">
            <input type="checkbox" [(ngModel)]="tlsForm.httpRedirect" id="tlsHttpRedirect" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
            <label for="tlsHttpRedirect" class="text-[11px] text-zinc-300 font-semibold cursor-pointer">Redirigir HTTP a HTTPS</label>
          </div>
        </div>
      </div>
      <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
        <button (click)="applyTlsConfig()" [disabled]="isApplyingTls()"
          class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-xs font-bold transition-all shadow-md">
          {{ isApplyingTls() ? 'Aplicando...' : 'Aplicar configuración' }}
        </button>
      </div>
    </div>

    <div class="space-y-6">
    <!-- Estado del SMTP de aplicación (recuperación de contraseña) — deliberadamente
         separado del SMTP por canal de alerta (pestaña "Canales de Alerta"): este es el único
         correo que el sistema puede enviar sin que exista ningún canal de alerta configurado. -->
    <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      <div class="p-6 space-y-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-white tracking-tight">SMTP de Aplicación</h3>
            <span class="text-[9px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-950/60 border border-zinc-850 rounded px-1.5 py-0.5">No es un canal de alerta</span>
          </div>
          <p class="text-[11px] text-zinc-500 mt-0.5">
            Exclusivo para el correo de recuperación de contraseña — no envía alertas de monitores. Por defecto se configura vía variables de entorno del servidor, pero puedes reutilizar el SMTP de un canal de tipo "Email (SMTP)" ya configurado en la pestaña {{ lang.t('settings.tabAlerts') }} en vez de repetir la configuración.
          </p>
        </div>

        @if (emailChannels().length > 0) {
          <div class="border-t border-zinc-850 pt-4">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Fuente del SMTP de aplicación</label>
            <div class="flex items-center gap-3">
              <select [ngModel]="appSmtpChannelId()" (ngModelChange)="onAppSmtpChannelChange($event)"
                class="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                <option [ngValue]="null">Variables de entorno (AZKIN_SMTP_*)</option>
                @for (c of emailChannels(); track c.id) {
                  <option [ngValue]="c.id">Reutilizar canal: {{ c.name }}</option>
                }
              </select>
              @if (isSavingAppSmtpChannel()) {
                <span class="text-[10px] text-zinc-500">Guardando...</span>
              }
            </div>
            <p class="text-[10px] text-zinc-600 mt-1.5">
              Si eliges un canal, el SMTP de aplicación sigue automáticamente cualquier cambio que hagas después en ese canal — no es una copia, es una referencia viva.
            </p>
          </div>
        }

        @if (smtpStatus()?.configured) {
          <div class="bg-zinc-950/60 border border-emerald-900/40 rounded-lg p-3 text-[11px] space-y-1">
            <p class="text-emerald-400 font-semibold">Configurado</p>
            <p class="text-zinc-300">Host: <span class="font-mono">{{ smtpStatus()?.host }}:{{ smtpStatus()?.port }}</span></p>
            <p class="text-zinc-500">TLS: {{ smtpStatus()?.secure ? 'activado' : 'desactivado' }}</p>
          </div>
        } @else {
          <div class="bg-zinc-950/60 border border-rose-900/40 rounded-lg p-3 text-[11px]">
            <p class="text-rose-400 font-semibold">No configurado</p>
            <p class="text-zinc-500 mt-0.5">La recuperación de contraseña no podrá enviar correos hasta configurar AZKIN_SMTP_* en el servidor.</p>
          </div>
        }

        <div class="flex items-end gap-3 border-t border-zinc-850 pt-4">
          <div class="flex-1">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Correo de prueba</label>
            <input type="email" [(ngModel)]="smtpTestRecipient" placeholder="tu-correo@ejemplo.com"
              class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500">
          </div>
          <button (click)="onSendTestEmail()" [disabled]="isSendingTestEmail()"
            class="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-xs font-bold transition-all shadow-md">
            {{ isSendingTestEmail() ? 'Enviando...' : 'Enviar prueba' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Motor de Monitoreo: umbral de latencia para DEGRADADO e intervalo acelerado
         (DOWN/DEGRADADO), configurables aquí sin editar .env ni reiniciar el contenedor. -->
    <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      <div class="p-6 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-white tracking-tight">Motor de Monitoreo</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5">
            Por defecto se configuran vía variables de entorno del servidor (<code class="font-mono">AZKIN_DEGRADED_LATENCY_MS</code> / <code class="font-mono">AZKIN_ACCELERATED_INTERVAL_SECONDS</code>). Ajustarlos aquí aplica en caliente, sin reiniciar el contenedor.
          </p>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Umbral de latencia para DEGRADADO (ms)</label>
          <div class="flex items-center gap-2">
            <input type="number" [(ngModel)]="monitoringForm.degradedLatencyMs" [placeholder]="monitoringDefaults()?.degradedLatencyMs + ''"
              class="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500">
            <button (click)="resetMonitoringField('degradedLatencyMs')" title="Restablecer a valor por defecto"
              class="text-[10px] text-zinc-500 hover:text-orange-400 font-bold px-2 py-2 rounded-lg border border-zinc-800 hover:border-orange-500/40 transition-colors">
              Restablecer
            </button>
          </div>
          <p class="text-[10px] text-zinc-600 mt-1">
            @if (monitoringForm.degradedLatencyMs === null) {
              Usando el valor por defecto: {{ monitoringDefaults()?.degradedLatencyMs }}ms.
            } @else {
              Un HTTP que responde OK pero tarda más de este umbral pasa a DEGRADADO en vez de UP.
            }
          </p>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Intervalo acelerado mientras DOWN/DEGRADADO (segundos)</label>
          <div class="flex items-center gap-2">
            <input type="number" [(ngModel)]="monitoringForm.acceleratedIntervalSeconds" [placeholder]="monitoringDefaults()?.acceleratedIntervalSeconds + ''"
              class="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500">
            <button (click)="resetMonitoringField('acceleratedIntervalSeconds')" title="Restablecer a valor por defecto"
              class="text-[10px] text-zinc-500 hover:text-orange-400 font-bold px-2 py-2 rounded-lg border border-zinc-800 hover:border-orange-500/40 transition-colors">
              Restablecer
            </button>
          </div>
          <p class="text-[10px] text-zinc-600 mt-1">
            @if (monitoringForm.acceleratedIntervalSeconds === null) {
              Usando el valor por defecto: {{ monitoringDefaults()?.acceleratedIntervalSeconds }}s.
            } @else {
              Nunca corre más rápido que el "Int. reintento" configurado en cada monitor individual.
            }
          </p>
        </div>
      </div>
      <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
        <button (click)="saveMonitoringSettings()" [disabled]="isSavingMonitoringSettings()"
          class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-xs font-bold transition-all shadow-md">
          {{ isSavingMonitoringSettings() ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
    </div>
    </div>

    <!-- Clave generada para AZKIN_TLS_ENCRYPTION_KEY (AZ-041): se genera 100% en el navegador
         (Web Crypto API) y nunca se envía al backend ni se guarda en ningún lado — el admin la
         copia a mano a su .env, para que la clave siga viviendo fuera de la base de datos que
         protege. -->
    @if (generatedTlsKey(); as key) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="generatedTlsKey.set(null)"></div>
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
          <h4 class="text-sm font-bold text-white font-black">Clave independiente para AZKIN_TLS_ENCRYPTION_KEY</h4>
          <p class="text-[11px] text-zinc-400">
            Esto es opcional: sin hacer nada, el cifrado en reposo ya funciona derivado de <code class="font-mono text-zinc-300">AZKIN_JWT_SECRET</code>. Solo si querés una clave independiente, cópiala a <code class="font-mono text-zinc-300">AZKIN_TLS_ENCRYPTION_KEY</code> en el <code class="font-mono text-zinc-300">.env</code> del servidor y reinicia el backend (<code class="font-mono text-zinc-300">docker compose up -d backend</code>) para aplicarla.
          </p>
          <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-orange-400 break-all select-all">{{ key }}</div>
          <p class="text-[10px] text-zinc-600">
            Azkin no la guarda en ningún lado — si cierras esta ventana sin copiarla, solo tienes que generar una nueva (no invalida nada, todavía no está en uso).
          </p>
          <button (click)="copyGeneratedTlsKey(key)" class="w-full py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">Copiar al portapapeles</button>
          <button (click)="generatedTlsKey.set(null)" class="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md">Cerrar</button>
        </div>
      </div>
    }
  `
})
export class TlsPanelComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly notificationService = inject(NotificationService);
  public readonly lang = inject(LanguageService);

  readonly tlsStatus = signal<TlsStatus | null>(null);
  readonly isApplyingTls = signal(false);
  tlsForm = { certPem: '', keyPem: '', chainPem: '', port: 443, httpRedirect: false };

  readonly generatedTlsKey = signal<string | null>(null);

  readonly smtpStatus = signal<SmtpStatus | null>(null);
  readonly isSendingTestEmail = signal(false);
  smtpTestRecipient = '';

  readonly emailChannels = computed(() => this.notificationService.channels().filter(c => c.type === 'email'));
  readonly appSmtpChannelId = signal<string | null>(null);
  readonly isSavingAppSmtpChannel = signal(false);

  readonly monitoringDefaults = signal<MonitoringEngineDefaults | null>(null);
  readonly isSavingMonitoringSettings = signal(false);
  monitoringForm: { degradedLatencyMs: number | null; acceleratedIntervalSeconds: number | null } = {
    degradedLatencyMs: null,
    acceleratedIntervalSeconds: null,
  };

  constructor() {
    this.loadTlsStatus();
    this.loadSmtpStatus();
    this.notificationService.loadChannels().subscribe();
    this.loadAppSmtpChannel();
    this.loadMonitoringSettings();
  }

  loadTlsStatus(): void {
    this.http.get<TlsStatus>('/api/v1/system/tls').subscribe({
      next: (status) => this.tlsStatus.set(status),
      error: () => {}
    });
  }

  loadSmtpStatus(): void {
    this.http.get<SmtpStatus>('/api/v1/system/smtp').subscribe({
      next: (status) => this.smtpStatus.set(status),
      error: () => {}
    });
  }

  loadAppSmtpChannel(): void {
    this.http.get<AppSmtpChannel>('/api/v1/system/smtp/channel').subscribe({
      next: (res) => this.appSmtpChannelId.set(res.notificationChannelId),
      error: () => {}
    });
  }

  onAppSmtpChannelChange(notificationChannelId: string | null): void {
    this.isSavingAppSmtpChannel.set(true);
    this.http.put<{ message: string }>('/api/v1/system/smtp/channel', { notificationChannelId }).subscribe({
      next: () => {
        this.isSavingAppSmtpChannel.set(false);
        this.appSmtpChannelId.set(notificationChannelId);
        this.toast.show('SMTP de aplicación actualizado.');
        this.loadSmtpStatus();
      },
      error: (err) => {
        this.isSavingAppSmtpChannel.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al actualizar el SMTP de aplicación.'));
        this.loadAppSmtpChannel();
      }
    });
  }

  loadMonitoringSettings(): void {
    this.http.get<MonitoringEngineSettings>('/api/v1/system/monitoring-settings').subscribe({
      next: (res) => {
        this.monitoringForm = {
          degradedLatencyMs: res.degradedLatencyMs,
          acceleratedIntervalSeconds: res.acceleratedIntervalSeconds,
        };
        this.monitoringDefaults.set(res.defaults);
      },
      error: () => {}
    });
  }

  resetMonitoringField(field: 'degradedLatencyMs' | 'acceleratedIntervalSeconds'): void {
    this.monitoringForm[field] = null;
  }

  saveMonitoringSettings(): void {
    this.isSavingMonitoringSettings.set(true);
    this.http.put<{ message: string }>('/api/v1/system/monitoring-settings', {
      degradedLatencyMs: this.monitoringForm.degradedLatencyMs,
      acceleratedIntervalSeconds: this.monitoringForm.acceleratedIntervalSeconds,
    }).subscribe({
      next: (res) => {
        this.isSavingMonitoringSettings.set(false);
        this.toast.show(res.message);
      },
      error: (err) => {
        this.isSavingMonitoringSettings.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al guardar la configuración del motor de monitoreo.'));
      }
    });
  }

  onSendTestEmail(): void {
    if (!this.smtpTestRecipient.trim() || !this.smtpTestRecipient.includes('@')) {
      this.toast.show('Ingresa un correo destinatario válido.');
      return;
    }
    this.isSendingTestEmail.set(true);
    this.http.post<{ message: string }>('/api/v1/system/smtp/test', { recipient: this.smtpTestRecipient }).subscribe({
      next: (res) => {
        this.isSendingTestEmail.set(false);
        this.toast.show(res.message);
      },
      error: (err) => {
        this.isSendingTestEmail.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al enviar el correo de prueba.'));
      }
    });
  }

  /**
   * Genera un valor válido de 64 caracteres hex para AZKIN_TLS_ENCRYPTION_KEY enteramente en el
   * navegador (Web Crypto API) — nunca se envía al backend ni se persiste en ningún lado. El
   * admin lo copia a mano a su `.env`, así la clave sigue viviendo fuera de la base de datos que
   * protege (ver AZ-041).
   */
  generateTlsEncryptionKey(): void {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    this.generatedTlsKey.set(hex);
  }

  copyGeneratedTlsKey(key: string): void {
    navigator.clipboard.writeText(key).then(() => this.toast.show('Copiada al portapapeles.'));
  }

  onTlsFileSelected(event: any, field: 'certPem' | 'keyPem' | 'chainPem'): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.tlsForm[field] = String(e.target.result).trim();
      event.target.value = '';
    };
    reader.onerror = () => {
      this.toast.show('No se pudo leer el archivo seleccionado.');
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  applyTlsConfig(): void {
    if (!this.tlsForm.certPem.trim() || !this.tlsForm.keyPem.trim()) {
      this.toast.show('El certificado y la clave privada son requeridos.');
      return;
    }
    this.isApplyingTls.set(true);
    this.http.put('/api/v1/system/tls', {
      certPem: this.tlsForm.certPem,
      keyPem: this.tlsForm.keyPem,
      chainPem: this.tlsForm.chainPem || undefined,
      port: this.tlsForm.port,
      httpRedirect: this.tlsForm.httpRedirect,
    }).subscribe({
      next: () => {
        this.isApplyingTls.set(false);
        this.toast.show('Configuración TLS aplicada correctamente.');
        this.loadTlsStatus();
      },
      error: (err) => {
        this.isApplyingTls.set(false);
        this.toast.show(extractApiErrorMessage(err, 'Error al aplicar la configuración TLS.'));
      }
    });
  }
}
