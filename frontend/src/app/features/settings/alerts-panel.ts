// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, INotificationChannel, AlertEventType, ALERT_EVENT_TYPES, INotificationTemplate } from '../../core/services/notification.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';
import { EmojiPickerComponent } from '../../shared/components/emoji-picker';

/**
 * Pestaña "Canales de Alerta": CRUD de canales de notificación (Slack/Discord/Telegram/Webhook/
 * Email) con plantillas de mensaje por evento, cheatsheet de variables y selector de emojis.
 * Extraido de settings.ts.
 */
@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, EmojiPickerComponent],
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
      <!-- Formulario de canal: layout de 2 columnas basado en el ancho real de la
           tarjeta (@container), no en el viewport — evita que se corte cuando la tarjeta
           ocupa solo una fracción angosta de una pantalla ancha. -->
      <div class="@container xl:col-span-2 bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg h-fit">
        <div class="p-6 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">{{ isEditingChannel() ? lang.t('settings.alerts.editChannel') : lang.t('settings.alerts.newChannel') }}</h3>
            <p class="text-[11px] text-zinc-500 mt-0.5">{{ lang.t('settings.alerts.channelDesc') }}</p>
          </div>

          <div class="grid grid-cols-1 @3xl:grid-cols-2 gap-6 pt-2">
            <!-- Columna izquierda: campos agnósticos al canal, altura fija -->
            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.alerts.name') }}</label>
                <input type="text" [(ngModel)]="channelForm.name" placeholder="Ej. Slack Operaciones"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
              </div>

              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.alerts.type') }}</label>
                <select [(ngModel)]="channelForm.type" (change)="onChannelTypeChange()"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                  <option value="slack">Slack Webhook</option>
                  <option value="discord">Discord Webhook</option>
                  <option value="telegram">Telegram Bot</option>
                  <option value="webhook">Webhook REST (JSON)</option>
                  <option value="email">Email (SMTP)</option>
                </select>
              </div>

              <!-- Enrutamiento centralizado por evento -->
              <div class="space-y-2 border-t border-zinc-850 pt-4">
                <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{{ lang.t('settings.alerts.scope') }}</span>
                <div class="flex flex-wrap gap-4 text-xs">
                  <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="eventsScope" value="all" [(ngModel)]="channelForm.eventsScope" class="text-orange-500 focus:ring-0">
                    {{ lang.t('settings.alerts.scopeAll') }}
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="eventsScope" value="selected" [(ngModel)]="channelForm.eventsScope" class="text-orange-500 focus:ring-0">
                    {{ lang.t('settings.alerts.scopeSelected') }}
                  </label>
                </div>
                @if (channelForm.eventsScope === 'selected') {
                  <div class="flex flex-wrap gap-3 pt-1">
                    @for (evt of alertEventTypes; track evt) {
                      <label class="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
                        <input type="checkbox" [checked]="channelForm.selectedEvents.includes(evt)" (change)="toggleSelectedEvent(evt)"
                          class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                        {{ evt }}
                      </label>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Columna derecha: campos específicos del canal + plantillas, todo el reflow queda contenido aquí -->
            <div class="space-y-4 @3xl:border-l @3xl:border-zinc-850 @3xl:pl-6">
              @if (channelForm.type === 'slack' || channelForm.type === 'discord' || channelForm.type === 'webhook') {
                <div>
                  <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Webhook URL</label>
                  <input type="url" [(ngModel)]="channelForm.webhookUrl" placeholder="https://hooks.slack.com/services/..."
                    class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                </div>
              }

              @if (channelForm.type === 'telegram') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Bot Token</label>
                    <input type="text" [(ngModel)]="channelForm.botToken" placeholder="Ej. 123456:ABC-def..."
                      class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Chat ID</label>
                    <input type="text" [(ngModel)]="channelForm.chatId" placeholder="Ej. -1001234567"
                      class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                  </div>
                </div>
              }

              @if (channelForm.type === 'email') {
                <div class="space-y-4 p-4 bg-zinc-950/40 rounded-lg border border-zinc-900">
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.alerts.recipientEmail') }}</label>
                    <input type="email" [(ngModel)]="channelForm.emailRecipient" placeholder="alertas@empresa.com"
                      class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                  </div>

                  <div class="border-t border-zinc-900 pt-3">
                    <span class="block text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-2">{{ lang.t('settings.alerts.smtpServer') }}</span>
                    <p class="text-[10px] text-zinc-600 mb-2">{{ lang.t('settings.alerts.smtpNote') }}</p>

                    <div class="space-y-3">
                      <div>
                        <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('settings.alerts.smtpHost') }}</label>
                        <input type="text" [(ngModel)]="channelForm.smtpHost" placeholder="Ej. mail.smtp.com"
                          class="w-full bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('settings.alerts.smtpPort') }}</label>
                          <input type="number" [(ngModel)]="channelForm.smtpPort" placeholder="587"
                            class="w-full bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
                        </div>
                        <div class="flex items-center gap-1.5 pt-4">
                          <input type="checkbox" [(ngModel)]="channelForm.smtpSecure" id="smtpSecure" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                          <label for="smtpSecure" class="text-[10px] font-semibold text-zinc-400 cursor-pointer">SSL/TLS</label>
                        </div>
                      </div>
                      <div>
                        <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('settings.alerts.smtpUser') }}</label>
                        <input type="text" [(ngModel)]="channelForm.smtpUsername" placeholder="alertas@azkin.io"
                          class="w-full bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
                      </div>
                      <div>
                        <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('settings.alerts.smtpPass') }}</label>
                        <input type="password" [(ngModel)]="channelForm.smtpPassword" placeholder="••••••••"
                          class="w-full bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
                      </div>
                      <div>
                        <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('settings.alerts.smtpFrom') }}</label>
                        <input type="email" [(ngModel)]="channelForm.smtpFrom" placeholder="alertas@azkin.io"
                          class="w-full bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500">
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Plantillas por evento con cheatsheet de variables y selector de emojis -->
              <div class="space-y-2 border-t border-zinc-850 pt-4">
                <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{{ lang.t('settings.alerts.templateLabel') }}</span>
                <select [(ngModel)]="channelForm.activeTemplateEvent"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                  @for (evt of alertEventTypes; track evt) {
                    <option [value]="evt">{{ evt }}</option>
                  }
                </select>

                @if (channelForm.type === 'email') {
                  <input #subjectInput type="text" [ngModel]="channelForm.templates[channelForm.activeTemplateEvent]?.subject ?? ''"
                    (ngModelChange)="setTemplateSubject($event)" (focus)="setActiveTemplateField(subjectInput)" placeholder="Asunto del correo"
                    class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500">
                }

                <!-- Cheatsheet de variables clickeable -->
                <div class="flex flex-wrap gap-1">
                  @for (v of templateVariableChips; track v.name) {
                    <button type="button" (click)="insertAtCursor(v.token)"
                      class="text-[9px] bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 hover:text-orange-400 text-zinc-400 px-1.5 py-0.5 rounded font-mono transition-colors">
                      {{ v.token }}
                    </button>
                  }
                  <button type="button" (click)="showEmojiPicker.set(true)"
                    class="text-[9px] bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 text-zinc-400 px-1.5 py-0.5 rounded font-mono transition-colors">
                    😀 Emoji
                  </button>
                </div>

                <textarea #bodyTextarea rows="4" [ngModel]="channelForm.templates[channelForm.activeTemplateEvent]?.body ?? ''"
                  (ngModelChange)="setTemplateBody($event)" (focus)="setActiveTemplateField(bodyTextarea)"
                  [placeholder]="templateBodyPlaceholder()"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-orange-500"></textarea>

                @if (currentTemplateBody()) {
                  <div class="bg-zinc-950/80 border border-zinc-900 rounded-lg p-2">
                    <span class="block text-[9px] font-bold text-zinc-500 uppercase mb-1">{{ lang.t('settings.alerts.preview') }}</span>
                    <pre class="text-[10px] text-zinc-400 whitespace-pre-wrap font-mono">{{ renderPreview(currentTemplateBody()) }}</pre>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
          @if (isEditingChannel()) {
            <button (click)="resetChannelForm()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">{{ lang.t('settings.alerts.cancel') }}</button>
          }
          <button (click)="onSaveChannel()" class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
            {{ isEditingChannel() ? lang.t('settings.alerts.update') : lang.t('settings.alerts.save') }}
          </button>
        </div>
      </div>

      <!-- Listado de canales -->
      <div class="xl:col-span-3 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">{{ lang.t('settings.alerts.activeChannels') }}</h3>
          <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ notificationService.channels().length }} {{ lang.t('settings.alerts.configured') }}</span>
        </div>

        @if (notificationService.channels().length === 0) {
          <div class="text-center py-16 bg-zinc-900/10 border border-zinc-800/80 rounded-xl space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-zinc-600 mx-auto">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
            </svg>
            <p class="text-zinc-500 text-xs font-medium">{{ lang.t('settings.alerts.noChannels') }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (c of notificationService.channels(); track c.id) {
              <div class="bg-zinc-900/20 border border-zinc-850 hover:border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-black text-zinc-200">{{ c.name }}</span>
                    <span class="text-[9px] bg-zinc-950 px-2 py-0.5 border border-zinc-800/80 text-zinc-500 rounded font-mono uppercase font-bold">{{ c.type }}</span>
                  </div>
                  <p class="text-[10px] text-zinc-500 truncate font-mono bg-zinc-950/60 p-2 rounded border border-zinc-900">
                    {{ c.type === 'email' ? c.config['email'] : (c.config['webhookUrl'] || c.config['chatId'] || lang.t('settings.alerts.channelConfigured')) }}
                  </p>
                </div>

                <p class="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">
                  {{ lang.t('settings.alerts.eventsLabel') }}: {{ c.events === 'all' ? lang.t('settings.alerts.scopeAll') : (c.events.join(', ') || lang.t('settings.alerts.scopeNone')) }}
                </p>

                <div class="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] font-bold">
                  <div class="flex items-center gap-1.5">
                    <select [ngModel]="testEventFor(c.id)" (ngModelChange)="setTestEventFor(c.id, $event)"
                      class="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[9px] text-zinc-300 focus:outline-none focus:border-orange-500">
                      @for (evt of alertEventTypes; track evt) {
                        <option [value]="evt">{{ evt }}</option>
                      }
                    </select>
                    <button (click)="onTestChannel(c.id)" class="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                      {{ lang.t('settings.alerts.testChannel') }}
                    </button>
                  </div>
                  <div class="flex items-center space-x-3">
                    <button (click)="onEditChannel(c)" class="text-zinc-400 hover:text-zinc-200 transition-colors">{{ lang.t('settings.alerts.edit') }}</button>
                    <button (click)="onDeleteChannel(c.id)" class="text-rose-500 hover:text-rose-400 transition-colors">{{ lang.t('settings.alerts.delete') }}</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <app-emoji-picker [open]="showEmojiPicker()" [options]="emojiOptions" (pick)="onEmojiPick($event)" (cancel)="showEmojiPicker.set(false)" />
  `
})
export class AlertsPanelComponent {
  readonly notificationService = inject(NotificationService);
  public readonly lang = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly isEditingChannel = signal(false);
  editingChannelId: string | null = null;
  channelForm = this.getEmptyChannelForm();

  readonly alertEventTypes = ALERT_EVENT_TYPES;

  // Contexto de ejemplo para la vista previa client-side (espeja backend/template-renderer.ts)
  private readonly previewSampleContext: Record<string, string> = {
    monitor: 'Monitor de ejemplo',
    monitorId: '000000000000000000000000',
    monitorType: 'http',
    url: 'https://ejemplo.azkin.io',
    status: 'DOWN',
    previousStatus: 'UP',
    datetime: new Date().toISOString(),
    httpCode: '200',
    ping: '42',
    detail: 'Ejemplo de detalle',
  };

  // ================= Cheatsheet de variables + selector de emojis =================
  readonly templateVariableChips = ['monitor', 'url', 'status', 'previousStatus', 'datetime', 'httpCode', 'ping', 'detail']
    .map(name => ({ name, token: `{{${name}}}` }));

  readonly emojiOptions = ['🚨', '✅', '❌', '⚠️', '🔴', '🟢', '🟡', '🕒', '📉', '📈', '🔥', '💥', '🌐', '🔒', '🔔', '📡', '🛑', '⏱️', '📊', '💡', '🚀', '👀', '📌', '🧯'];

  readonly showEmojiPicker = signal(false);
  private activeTemplateEl: HTMLInputElement | HTMLTextAreaElement | null = null;

  readonly testEventSelection: Record<string, AlertEventType> = {};

  constructor() {
    this.notificationService.loadChannels().subscribe();
  }

  private showToastFeedback(msg: string): void {
    this.toast.show(msg);
  }

  private getEmptyChannelForm() {
    return {
      name: '',
      type: 'slack' as INotificationChannel['type'],
      webhookUrl: '',
      botToken: '',
      chatId: '',
      emailRecipient: '',
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: false,
      smtpUsername: '',
      smtpPassword: '',
      smtpFrom: '',
      eventsScope: 'all' as 'all' | 'selected',
      selectedEvents: [] as AlertEventType[],
      templates: {} as Partial<Record<AlertEventType, INotificationTemplate>>,
      activeTemplateEvent: 'DOWN' as AlertEventType,
    };
  }

  toggleSelectedEvent(evt: AlertEventType): void {
    const current = this.channelForm.selectedEvents;
    this.channelForm.selectedEvents = current.includes(evt)
      ? current.filter(e => e !== evt)
      : [...current, evt];
  }

  currentTemplateBody(): string {
    return this.channelForm.templates[this.channelForm.activeTemplateEvent]?.body ?? '';
  }

  setTemplateBody(body: string): void {
    const evt = this.channelForm.activeTemplateEvent;
    const existing = this.channelForm.templates[evt] ?? { body: '' };
    this.channelForm.templates = { ...this.channelForm.templates, [evt]: { ...existing, body } };
  }

  setTemplateSubject(subject: string): void {
    const evt = this.channelForm.activeTemplateEvent;
    const existing = this.channelForm.templates[evt] ?? { body: '' };
    this.channelForm.templates = { ...this.channelForm.templates, [evt]: { ...existing, subject } };
  }

  templateBodyPlaceholder(): string {
    return this.channelForm.type === 'webhook'
      ? '{"monitor": "{{monitor}}", "status": "{{status}}"}'
      : 'Mensaje con variables {{monitor}}, {{url}}, {{status}}...';
  }

  renderPreview(body: string): string {
    return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) =>
      this.previewSampleContext[key] ?? match
    );
  }

  setActiveTemplateField(el: HTMLInputElement | HTMLTextAreaElement): void {
    this.activeTemplateEl = el;
  }

  onEmojiPick(emoji: string): void {
    this.insertAtCursor(emoji);
    this.showEmojiPicker.set(false);
  }

  /** Inserta texto (variable o emoji) en la posición del cursor del campo de plantilla enfocado. */
  insertAtCursor(text: string): void {
    const el = this.activeTemplateEl;
    const isSubject = el?.tagName === 'INPUT';
    const current = isSubject
      ? (this.channelForm.templates[this.channelForm.activeTemplateEvent]?.subject ?? '')
      : this.currentTemplateBody();

    let updated: string;
    let cursorPos: number;
    if (el && document.activeElement === el && el.selectionStart !== null) {
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;
      updated = current.slice(0, start) + text + current.slice(end);
      cursorPos = start + text.length;
    } else {
      updated = current + text;
      cursorPos = updated.length;
    }

    if (isSubject) {
      this.setTemplateSubject(updated);
    } else {
      this.setTemplateBody(updated);
    }

    if (el) {
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(cursorPos, cursorPos);
      });
    }
  }

  onChannelTypeChange(): void {
    this.channelForm.webhookUrl = '';
    this.channelForm.botToken = '';
    this.channelForm.chatId = '';
    this.channelForm.emailRecipient = '';
    this.channelForm.smtpHost = '';
    this.channelForm.smtpPort = 587;
    this.channelForm.smtpSecure = false;
    this.channelForm.smtpUsername = '';
    this.channelForm.smtpPassword = '';
    this.channelForm.smtpFrom = '';
  }

  resetChannelForm(): void {
    this.isEditingChannel.set(false);
    this.editingChannelId = null;
    this.channelForm = this.getEmptyChannelForm();
  }

  onEditChannel(channel: INotificationChannel): void {
    this.isEditingChannel.set(true);
    this.editingChannelId = channel.id;
    this.channelForm = {
      name: channel.name,
      type: channel.type,
      webhookUrl: channel.config['webhookUrl'] || '',
      botToken: channel.config['botToken'] || '',
      chatId: channel.config['chatId'] || '',
      emailRecipient: channel.config['email'] || '',
      smtpHost: channel.config['smtpHost'] || '',
      smtpPort: channel.config['smtpPort'] || 587,
      smtpSecure: !!channel.config['smtpSecure'],
      smtpUsername: channel.config['smtpUsername'] || '',
      smtpPassword: channel.config['smtpPassword'] || '',
      smtpFrom: channel.config['smtpFrom'] || '',
      eventsScope: channel.events === 'all' ? 'all' : 'selected',
      selectedEvents: channel.events === 'all' ? [] : [...channel.events],
      templates: channel.templates ?? {},
      activeTemplateEvent: 'DOWN',
    };
  }

  onSaveChannel(): void {
    if (!this.channelForm.name.trim()) return;

    // Estructurar el config específico por tipo
    const config: Record<string, any> = {};
    if (this.channelForm.type === 'slack' || this.channelForm.type === 'discord' || this.channelForm.type === 'webhook') {
      config['webhookUrl'] = this.channelForm.webhookUrl;
    } else if (this.channelForm.type === 'telegram') {
      config['botToken'] = this.channelForm.botToken;
      config['chatId'] = this.channelForm.chatId;
    } else if (this.channelForm.type === 'email') {
      config['email'] = this.channelForm.emailRecipient;
      config['smtpHost'] = this.channelForm.smtpHost;
      config['smtpPort'] = this.channelForm.smtpPort;
      config['smtpSecure'] = this.channelForm.smtpSecure;
      config['smtpUsername'] = this.channelForm.smtpUsername;
      config['smtpPassword'] = this.channelForm.smtpPassword;
      config['smtpFrom'] = this.channelForm.smtpFrom;
    }

    const payload: Partial<INotificationChannel> = {
      name: this.channelForm.name,
      type: this.channelForm.type,
      config,
      isActive: true,
      events: this.channelForm.eventsScope === 'all' ? 'all' : this.channelForm.selectedEvents,
      templates: this.channelForm.templates,
    };

    if (this.isEditingChannel() && this.editingChannelId) {
      this.notificationService.update(this.editingChannelId, payload).subscribe({
        next: () => {
          this.resetChannelForm();
          this.showToastFeedback('Canal de notificación actualizado.');
        }
      });
    } else {
      this.notificationService.create(payload).subscribe({
        next: () => {
          this.resetChannelForm();
          this.showToastFeedback('Canal de notificación creado.');
        }
      });
    }
  }

  onDeleteChannel(id: string): void {
    this.confirm.ask(
      '¿Eliminar Canal?',
      '¿Estás seguro de eliminar este canal de alertas? Se suspenderán los reportes asociados.',
      () => {
        this.notificationService.delete(id).subscribe({
          next: () => this.showToastFeedback('Canal eliminado.')
        });
      }
    );
  }

  testEventFor(id: string): AlertEventType {
    return this.testEventSelection[id] ?? 'DOWN';
  }

  setTestEventFor(id: string, evt: AlertEventType): void {
    this.testEventSelection[id] = evt;
  }

  onTestChannel(id: string): void {
    this.showToastFeedback('Enviando notificación de prueba...');
    this.notificationService.testChannel(id, this.testEventFor(id)).subscribe({
      next: (res) => this.showToastFeedback(res.message || 'Prueba enviada correctamente.'),
      error: (err) => this.showToastFeedback(extractApiErrorMessage(err, 'Error al enviar la prueba.'))
    });
  }
}
