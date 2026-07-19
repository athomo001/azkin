// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService, IViewer, IViewerPermission, IAdmin } from '../../core/services/user.service';
import { NotificationService, INotificationChannel, AlertEventType, ALERT_EVENT_TYPES, INotificationTemplate } from '../../core/services/notification.service';
import { MonitorService } from '../../core/services/monitor.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';
import { FileDownloadService } from '../../core/services/file-download.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <!-- Navbar -->
      <nav class="bg-zinc-900/40 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div class="flex items-center gap-3">
          <button routerLink="/dashboard" class="text-zinc-500 hover:text-orange-500 transition-colors" [title]="lang.t('settings.backToDashboard')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <img src="logo-azkin.png" alt="Azkin Logo" class="h-6 w-auto">
          <h1 class="text-xl font-black text-orange-500 tracking-tight cursor-pointer" routerLink="/dashboard">Azkin</h1>
          <span class="text-zinc-700">/</span>
          <span class="text-zinc-300 font-semibold text-sm">{{ lang.t('settings.title') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="themeService.toggle($event)" class="text-zinc-400 hover:text-orange-500 transition-colors p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40" title="Cambiar tema">
            @if (themeService.isLightTheme()) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-amber-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M3 12h2.25m-.386-6.364 1.591 1.591M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            }
          </button>
          <button (click)="lang.toggleLanguage()" class="text-zinc-400 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-950/40 text-[10px] font-black uppercase tracking-wider" [title]="lang.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'">
            {{ lang.currentLang() }}
          </button>
        </div>
      </nav>

      <!-- Toast de feedback -->
      @if (toast()) {
        <div class="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl bg-zinc-900 border-zinc-800 text-white animate-fade-in">
          <span class="w-2 h-2 mt-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          <span>{{ toast() }}</span>
        </div>
      }

      <main class="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto space-y-8">
        
        <!-- Cabecera de la sección de Configuración -->
        <div class="space-y-2">
          <h2 class="text-2xl font-black tracking-tight text-white">{{ lang.t('settings.title') }}</h2>
          <p class="text-zinc-400 text-xs">{{ lang.t('settings.subtitle') }}</p>
        </div>

        <!-- Pestañas de subnavegación estilo Vercel -->
        <div class="flex border-b border-zinc-800/80 gap-6 text-sm">
          <button (click)="activeTab.set('alerts')" 
            [class]="activeTab() === 'alerts' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'" 
            class="transition-all relative z-10 px-1">
            {{ lang.t('settings.tabAlerts') }}
          </button>
          <button (click)="activeTab.set('viewers')" 
            [class]="activeTab() === 'viewers' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'" 
            class="transition-all relative z-10 px-1">
            {{ lang.t('settings.tabViewers') }}
          </button>
          <button (click)="activeTab.set('backups')"
            [class]="activeTab() === 'backups' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'"
            class="transition-all relative z-10 px-1">
            {{ lang.t('settings.tabBackups') }}
          </button>
          <button (click)="activeTab.set('tls')"
            [class]="activeTab() === 'tls' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'"
            class="transition-all relative z-10 px-1">
            TLS / Sistema
          </button>
          <button (click)="activeTab.set('api')"
            [class]="activeTab() === 'api' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'"
            class="transition-all relative z-10 px-1">
            API
          </button>
          <button (click)="activeTab.set('audit'); loadAuditLog()"
            [class]="activeTab() === 'audit' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'"
            class="transition-all relative z-10 px-1">
            Auditoría
          </button>
        </div>

        <div class="pt-2 animate-fade-in">
          
          <!-- ================= PESTAÑA: CANALES DE ALERTA ================= -->
          @if (activeTab() === 'alerts') {
            <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <!-- Formulario de canal: layout de 2 columnas (AZ-025) basado en el ancho real de la
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

                      <!-- AZ-007: Enrutamiento centralizado por evento -->
                      <div class="space-y-2 border-t border-zinc-850 pt-4">
                        <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Alcance de alertas</span>
                        <div class="flex flex-wrap gap-4 text-xs">
                          <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="eventsScope" value="all" [(ngModel)]="channelForm.eventsScope" class="text-orange-500 focus:ring-0">
                            Todas las alertas
                          </label>
                          <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="eventsScope" value="selected" [(ngModel)]="channelForm.eventsScope" class="text-orange-500 focus:ring-0">
                            Solo seleccionadas
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
                            <p class="text-[10px] text-zinc-600 mb-2">Servidor SMTP exclusivo de este canal de alerta. No afecta ni reemplaza el SMTP de recuperación de contraseña (pestaña TLS / Sistema).</p>

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

                      <!-- AZ-004/AZ-026: Plantillas por evento con cheatsheet de variables y selector de emojis -->
                      <div class="space-y-2 border-t border-zinc-850 pt-4">
                        <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Plantilla de mensaje</span>
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
                            <span class="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Vista previa</span>
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
                            {{ c.type === 'email' ? c.config['email'] : (c.config['webhookUrl'] || c.config['chatId'] || 'Configurado') }}
                          </p>
                        </div>
                        
                        <p class="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">
                          Eventos: {{ c.events === 'all' ? 'Todas las alertas' : (c.events.join(', ') || 'Ninguno') }}
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
          }

          <!-- ================= PESTAÑA: VIEWERS / USUARIOS ================= -->
          @if (activeTab() === 'viewers') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Formulario de Viewer -->
              <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg h-fit">
                <div class="p-6 space-y-4">
                  <div>
                    <h3 class="text-sm font-bold text-white tracking-tight">{{ isEditingViewer() ? lang.t('settings.viewers.editTitle') : lang.t('settings.viewers.createTitle') }}</h3>
                    <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">{{ lang.t('settings.viewers.desc') }}</p>
                  </div>
                  
                  <div class="space-y-4 pt-2">
                    @if (!isEditingViewer()) {
                      <div>
                        <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.viewers.username') }}</label>
                        <input type="text" [(ngModel)]="viewerForm.username" placeholder="Ej. tv_operaciones" required
                          class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.viewers.email') }}</label>
                        <input type="email" [(ngModel)]="viewerForm.email" placeholder="viewer@empresa.com"
                          class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.viewers.password') }}</label>
                        <input type="password" [(ngModel)]="viewerForm.password" [placeholder]="lang.t('settings.viewers.minChars')"
                          class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                      </div>

                      <div class="flex items-center gap-2 bg-zinc-950/60 p-3 rounded-lg border border-orange-900/40">
                        <input type="checkbox" [(ngModel)]="viewerForm.asAdmin" id="asAdmin" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                        <label for="asAdmin" class="text-[11px] text-orange-400 font-semibold cursor-pointer">Crear como Administrador (acceso total, sin permisos granulares)</label>
                      </div>
                    }

                    @if (!viewerForm.asAdmin) {
                      <div class="flex items-center gap-2 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
                        <input type="checkbox" [(ngModel)]="viewerForm.isTvSessionEnabled" id="isTvSessionEnabled" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                        <label for="isTvSessionEnabled" class="text-[11px] text-zinc-300 font-semibold cursor-pointer">{{ lang.t('settings.viewers.extSession') }}</label>
                      </div>
                    }

                    <!-- Permisos Granulares -->
                    @if (!viewerForm.asAdmin) {
                    <div class="space-y-3 border-t border-zinc-850 pt-4">
                      <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{{ lang.t('settings.viewers.granularPerms') }}</span>

                      <label class="flex items-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 cursor-pointer">
                        <input type="checkbox" [checked]="isAllSelected()" (change)="setAllSelected($any($event.target).checked)"
                          class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                        <span class="text-[11px] text-zinc-200 font-semibold">{{ lang.t('settings.viewers.viewAll') }}</span>
                      </label>

                      @if (!isAllSelected()) {
                        <div class="space-y-2 animate-fade-in">
                          <div>
                            <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{{ lang.t('settings.viewers.viewGroup') }}</span>
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
                            <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{{ lang.t('settings.viewers.viewMonitor') }}</span>
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

                      <!-- Resumen de lo que se guardará -->
                      <div class="space-y-1.5 mt-2 max-h-24 overflow-y-auto pr-1 border-t border-zinc-850 pt-2">
                        @if (viewerForm.permissions.length === 0) {
                          <p class="text-[10px] text-rose-400">Sin permisos seleccionados — este viewer no verá ningún monitor.</p>
                        }
                        @for (p of viewerForm.permissions; track $index) {
                          <div class="flex items-center justify-between bg-zinc-950/80 border border-zinc-850 px-3 py-2 rounded-lg text-[10px] animate-fade-in">
                            <div class="flex items-center gap-2">
                              <span class="text-orange-500 uppercase tracking-widest text-[8px] font-black bg-orange-500/10 px-1 py-0.5 rounded">{{ p.type }}</span>
                              <span class="text-zinc-300 font-mono font-semibold">{{ p.type === 'monitor' ? monitorNameById(p.value) : (p.value || 'Todo') }}</span>
                            </div>
                            <button (click)="removeTempPermission($index)" class="text-rose-500 hover:text-rose-400 font-bold">{{ lang.t('settings.alerts.delete') }}</button>
                          </div>
                        }
                      </div>
                    </div>
                    }
                  </div>
                </div>
                
                <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
                  @if (isEditingViewer()) {
                    <button (click)="resetViewerForm()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">{{ lang.t('settings.viewers.cancel') }}</button>
                  }
                  <button (click)="onSaveViewer()" class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
                    {{ isEditingViewer() ? lang.t('settings.viewers.updateBtn') : (viewerForm.asAdmin ? 'Crear Administrador' : lang.t('settings.viewers.createBtn')) }}
                  </button>
                </div>
              </div>

              <!-- Listado de Viewers -->
              <div class="col-span-2 space-y-4">
                <!-- Administradores del sistema (sin aislamiento por tenant) -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Administradores</h3>
                    <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ userService.admins().length }} activos</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (a of userService.admins(); track a.id) {
                      <div class="bg-zinc-900/20 border rounded-xl p-4 flex flex-col gap-3 transition-all"
                        [class.border-zinc-850]="!a.isBlocked" [class.border-rose-900/50]="a.isBlocked">
                        <div class="flex justify-between items-center gap-2">
                          <span class="text-xs font-black text-zinc-200 truncate" [title]="a.email">{{ a.email }}</span>
                          @if (a.isBlocked) {
                            <span class="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0">Bloqueado</span>
                          } @else {
                            <span class="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0">Admin</span>
                          }
                        </div>
                        <div class="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] font-bold">
                          <span class="text-zinc-600 font-mono text-[9px]">{{ a.id === authService.currentUser()?.userId ? 'Tu cuenta' : '' }}</span>
                          <div class="flex items-center space-x-3">
                            <button (click)="onEditAdmin(a)" class="text-zinc-400 hover:text-zinc-200 transition-colors">{{ lang.t('common.edit') }}</button>
                            <button (click)="onPromptResetAdminPassword(a)" class="text-orange-500 hover:text-orange-400 transition-colors">{{ lang.t('settings.viewers.key') }}</button>
                            @if (a.id !== authService.currentUser()?.userId) {
                              <button (click)="onToggleAdminBlocked(a)" class="text-amber-500 hover:text-amber-400 transition-colors">{{ a.isBlocked ? 'Desbloquear' : 'Bloquear' }}</button>
                              <button (click)="onDeleteAdmin(a)" class="text-rose-500 hover:text-rose-400 transition-colors">{{ lang.t('common.delete') }}</button>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">{{ lang.t('settings.viewers.list') }}</h3>
                  <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ userService.viewers().length }} {{ lang.t('settings.viewers.active') }}</span>
                </div>

                @if (userService.viewers().length === 0) {
                  <div class="text-center py-16 bg-zinc-900/10 border border-zinc-800/80 rounded-xl space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-zinc-600 mx-auto">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20.8c-2.113 0-4.047-.57-5.7-1.56v-.109A5.404 5.404 0 0 1 10 14.25c1.25 0 2.39.422 3.292 1.13M6.625 19.5a9.338 9.338 0 0 1-2.625-.372 5.405 5.405 0 0 1-4.017-5.105c0-1.518.81-2.885 2.13-3.645A3.001 3.001 0 0 1 7 7.5a3 3 0 0 1 2.875 2.128M15 11.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8.25 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                    </svg>
                    <p class="text-zinc-500 text-xs font-medium">{{ lang.t('settings.viewers.noViewers') }}</p>
                  </div>
                } @else {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (v of userService.viewers(); track v.id) {
                      <div class="bg-zinc-900/20 border border-zinc-850 hover:border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all">
                        <div class="space-y-3">
                          <div class="flex justify-between items-center">
                            <span class="text-xs font-black text-zinc-200 truncate pr-2 w-36" [title]="v.email || v.username">{{ v.email || v.username }}</span>
                            <span class="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono uppercase font-bold">{{ v.role }}</span>
                          </div>
                          
                          <div class="space-y-1">
                            <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{{ lang.t('settings.viewers.permsLabel') }}</span>
                            <div class="flex flex-wrap gap-1 max-h-12 overflow-y-auto pr-1">
                              @if (v.permissions.length === 0) {
                                <span class="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-mono font-medium">
                                  Sin permisos — no verá ningún monitor
                                </span>
                              }
                              @for (p of v.permissions; track $index) {
                                <span class="text-[9px] bg-zinc-950 border border-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-medium">
                                  {{ p.type === 'all' ? lang.t('settings.viewers.viewAllShort') : (p.type + ': ' + p.value) }}
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div class="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] font-bold">
                          <span class="text-zinc-500 font-mono text-[9px] flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="v.isTvSessionEnabled" [class.bg-zinc-700]="!v.isTvSessionEnabled"></span>
                            TV: {{ v.isTvSessionEnabled ? 'ON' : 'OFF' }}
                          </span>
                          <div class="flex items-center space-x-3">
                            <button (click)="onEditViewer(v)" class="text-zinc-400 hover:text-zinc-200 transition-colors">{{ lang.t('common.edit') }}</button>
                            <button (click)="onPromptChangeViewerPassword(v)" class="text-orange-500 hover:text-orange-400 transition-colors">{{ lang.t('settings.viewers.key') }}</button>
                            <button (click)="onDeleteViewer(v.id)" class="text-rose-500 hover:text-rose-400 transition-colors">{{ lang.t('common.delete') }}</button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- ================= PESTAÑA: RESPALDOS ================= -->
          @if (activeTab() === 'backups') {
            <div class="max-w-xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
              <div class="p-6 space-y-6">
                <div>
                  <h3 class="text-sm font-bold text-white tracking-tight">{{ lang.t('settings.backups.sectionTitle') }}</h3>
                  <p class="text-[11px] text-zinc-500 mt-0.5">{{ lang.t('settings.backups.sectionDesc') }}</p>
                </div>
                
                <!-- AZ-005: estrategia de respaldo -->
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

                <!-- AZ-005: respaldos persistidos -->
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
                        <button (click)="downloadBackup(b.id)" class="text-orange-500 hover:text-orange-400 font-bold">Descargar</button>
                      </div>
                    }
                  }
                </div>

                <!-- AZ-028: importación masiva de monitores vía CSV -->
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
                      <span class="text-[10px] text-zinc-500 mt-1 font-medium">Columnas: name, type, target, port, interval, retries, retryInterval, group, tags</span>
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
              </div>
            </div>
          }

          <!-- ================= PESTAÑA: TLS / HTTPS (AZ-006) ================= -->
          @if (activeTab() === 'tls') {
            <div class="max-w-xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
              <div class="p-6 space-y-4">
                <div>
                  <h3 class="text-sm font-bold text-white tracking-tight">Certificado SSL/TLS</h3>
                  <p class="text-[11px] text-zinc-500 mt-0.5">
                    Configura el listener HTTPS nativo del backend. La clave privada se cifra en reposo.
                  </p>
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

            <!-- AZ-031/AZ-035: estado del SMTP de aplicación (recuperación de contraseña) — deliberadamente
                 separado del SMTP por canal de alerta (pestaña "Canales de Alerta"): este es el único
                 correo que el sistema puede enviar sin que exista ningún canal de alerta configurado. -->
            <div class="max-w-xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg mt-6">
              <div class="p-6 space-y-4">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-white tracking-tight">SMTP de Aplicación</h3>
                    <span class="text-[9px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-950/60 border border-zinc-850 rounded px-1.5 py-0.5">No es un canal de alerta</span>
                  </div>
                  <p class="text-[11px] text-zinc-500 mt-0.5">
                    Exclusivo para el correo de recuperación de contraseña — no envía alertas de monitores. Se configura vía variables de entorno del servidor, no desde esta pantalla. Para notificar caídas/recuperaciones por correo, crea un canal de tipo "Email (SMTP)" en la pestaña {{ lang.t('settings.tabAlerts') }}.
                  </p>
                </div>

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
          }

          <!-- ================= PESTAÑA: API PÚBLICA (AZ-029) ================= -->
          @if (activeTab() === 'api') {
            <div class="max-w-2xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
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
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          }

          <!-- ================= PESTAÑA: AUDITORÍA (AZ-030) ================= -->
          @if (activeTab() === 'audit') {
            <div class="max-w-3xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
              <div class="p-6 space-y-4">
                <div>
                  <h3 class="text-sm font-bold text-white tracking-tight">Historial de Auditoría</h3>
                  <p class="text-[11px] text-zinc-500 mt-0.5">
                    Acciones administrativas sensibles registradas por el sistema (borrado masivo de monitores, cambios de TLS, recuperación de contraseña).
                  </p>
                </div>

                @if (auditLogEntries().length === 0) {
                  <p class="text-[11px] text-zinc-600 border-t border-zinc-850 pt-4">Aún no hay eventos de auditoría registrados.</p>
                } @else {
                  <div class="space-y-2 border-t border-zinc-850 pt-4">
                    @for (e of auditLogEntries(); track e.id) {
                      <div class="bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 text-[11px] space-y-1">
                        <div class="flex items-center justify-between">
                          <span class="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono uppercase font-bold">{{ e.action }}</span>
                          <span class="text-zinc-600 font-mono text-[10px]">{{ e.createdAt | date:'short' }}</span>
                        </div>
                        <p class="text-zinc-300">
                          <span class="font-semibold">{{ e.actorEmail }}</span>
                          <span class="text-zinc-600"> — {{ e.targetType }}</span>
                          @if (e.targetIds && e.targetIds.length > 0) {
                            <span class="text-zinc-600"> ({{ e.targetIds.length }} elemento(s))</span>
                          }
                        </p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <footer class="pt-6 mt-6 border-t border-zinc-900">
          <p class="text-center text-[9px] text-zinc-700" title="Ver LICENSE.md para el texto completo">
            Protegido bajo SSPL v1 / Licencia Comercial Requerida para Producción
          </p>
        </footer>
      </main>

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

      <!-- Custom Confirm Modal -->
      @if (showConfirmModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="closeConfirm()"></div>
          <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in text-center space-y-5">
            <div class="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white uppercase tracking-wider font-black">{{ confirmModalTitle }}</h4>
              <p class="text-xs text-zinc-400 mt-2">{{ confirmModalMsg }}</p>
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="closeConfirm()" class="flex-1 py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
              <button (click)="executeConfirm()" class="flex-1 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-lg">{{ lang.t('common.confirm') }}</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Selector de Emojis (AZ-026) -->
      @if (showEmojiPicker()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="showEmojiPicker.set(false)"></div>
          <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
            <h4 class="text-sm font-bold text-white font-black">Selecciona un emoji</h4>
            <div class="grid grid-cols-8 gap-1.5 max-h-64 overflow-y-auto pr-1">
              @for (e of emojiOptions; track e) {
                <button type="button" (click)="insertAtCursor(e); showEmojiPicker.set(false)"
                  class="text-lg p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">{{ e }}</button>
              }
            </div>
            <button (click)="showEmojiPicker.set(false)" class="w-full py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
          </div>
        </div>
      }

      <!-- Modal Editar Email de Administrador -->
      @if (showEditAdminModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="showEditAdminModal.set(false)"></div>
          <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
            <div>
              <h4 class="text-sm font-bold text-white font-black">Editar Administrador</h4>
              <p class="text-[10px] text-zinc-500">{{ adminEditTarget?.email }}</p>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Correo electrónico</label>
              <input type="email" [(ngModel)]="adminEditEmail" placeholder="admin@ejemplo.com"
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="showEditAdminModal.set(false)" class="flex-1 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
              <button (click)="onConfirmEditAdmin()" class="flex-1 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md">{{ lang.t('common.save') }}</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Resetear Contraseña de Administrador -->
      @if (showAdminPasswordModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="showAdminPasswordModal.set(false)"></div>
          <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-white font-black">Restablecer contraseña</h4>
                <p class="text-[10px] text-zinc-500">{{ adminPasswordTarget?.email }}</p>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.profile.newPass') }}</label>
              <input type="password" [(ngModel)]="adminNewPassword" [placeholder]="lang.t('settings.viewers.minChars')"
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="showAdminPasswordModal.set(false)" class="flex-1 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
              <button (click)="onConfirmResetAdminPassword()" class="flex-1 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md">{{ lang.t('common.save') }}</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Cambio de Contraseña de Viewer -->
      @if (showViewerPasswordModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="showViewerPasswordModal.set(false)"></div>
          <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-white font-black">{{ lang.t('settings.viewers.changePass') }}</h4>
                <p class="text-[10px] text-zinc-500">{{ viewerPasswordTarget?.email || viewerPasswordTarget?.username }}</p>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.profile.newPass') }}</label>
              <input type="password" [(ngModel)]="viewerNewPassword" [placeholder]="lang.t('settings.viewers.minChars')"
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="showViewerPasswordModal.set(false)" class="flex-1 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
              <button (click)="onConfirmViewerPassword()" class="flex-1 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md">{{ lang.t('common.save') }}</button>
            </div>
          </div>
        </div>
      }
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
export class SettingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  readonly userService = inject(UserService);
  readonly notificationService = inject(NotificationService);
  readonly monitorService = inject(MonitorService);
  public readonly lang = inject(LanguageService);
  public readonly themeService = inject(ThemeService);
  private readonly fileDownload = inject(FileDownloadService);
  public readonly authService = inject(AuthService);

  readonly toast = signal<string | null>(null);
  readonly activeTab = signal<'alerts' | 'viewers' | 'backups' | 'tls' | 'api' | 'audit'>('alerts');

  // --- Formulario de Canales ---
  readonly isEditingChannel = signal(false);
  editingChannelId: string | null = null;
  channelForm = this.getEmptyChannelForm();

  // --- Formulario de Viewers ---
  readonly isEditingViewer = signal(false);
  editingViewerId: string | null = null;
  viewerForm = this.getEmptyViewerForm();

  // --- Modal de Cambio de Contraseña de Viewer ---
  readonly showViewerPasswordModal = signal(false);
  viewerPasswordTarget: IViewer | null = null;
  viewerNewPassword = '';

  // --- Modales de gestión de otros Administradores (AZ-023) ---
  readonly showEditAdminModal = signal(false);
  adminEditTarget: IAdmin | null = null;
  adminEditEmail = '';

  readonly showAdminPasswordModal = signal(false);
  adminPasswordTarget: IAdmin | null = null;
  adminNewPassword = '';

  // --- Modal de Confirmación Personalizado ---
  readonly showConfirmModal = signal(false);
  confirmModalTitle = '';
  confirmModalMsg = '';
  confirmActionCallback: (() => void) | null = null;

  // --- Computed: grupos únicos extraídos de los monitores ---
  readonly uniqueGroups = computed(() => {
    const groups = this.monitorService.monitors()
      .map(m => m.group)
      .filter((g): g is string => !!g && g.trim().length > 0);
    return [...new Set(groups)];
  });

  // ================= Permisos granulares (checkboxes, sin paso intermedio de "Añadir") =================
  isAllSelected(): boolean {
    return this.viewerForm.permissions.some(p => p.type === 'all');
  }

  setAllSelected(checked: boolean): void {
    this.viewerForm.permissions = checked ? [{ type: 'all' }] : [];
  }

  isGroupChecked(group: string): boolean {
    return this.viewerForm.permissions.some(p => p.type === 'group' && p.value === group);
  }

  toggleGroup(group: string): void {
    if (this.isGroupChecked(group)) {
      this.viewerForm.permissions = this.viewerForm.permissions.filter(p => !(p.type === 'group' && p.value === group));
    } else {
      this.viewerForm.permissions = [...this.viewerForm.permissions, { type: 'group', value: group }];
    }
  }

  isMonitorChecked(monitorId: string): boolean {
    return this.viewerForm.permissions.some(p => p.type === 'monitor' && p.value === monitorId);
  }

  toggleMonitor(monitorId: string): void {
    if (this.isMonitorChecked(monitorId)) {
      this.viewerForm.permissions = this.viewerForm.permissions.filter(p => !(p.type === 'monitor' && p.value === monitorId));
    } else {
      this.viewerForm.permissions = [...this.viewerForm.permissions, { type: 'monitor', value: monitorId }];
    }
  }

  monitorNameById(id?: string): string {
    if (!id) return 'Todo';
    return this.monitorService.monitors().find(m => m.id === id)?.name ?? id;
  }

  ngOnInit(): void {
    this.userService.loadViewers().subscribe();
    this.userService.loadAdmins().subscribe();
    this.notificationService.loadChannels().subscribe();
    this.monitorService.loadMonitors().subscribe();
    this.loadBackups();
    this.loadTlsStatus();
    this.loadSmtpStatus();
    this.loadApiKeys();

    const requestedTab = this.route.snapshot.queryParamMap.get('tab');
    const validTabs = ['alerts', 'viewers', 'backups', 'tls', 'api', 'audit'] as const;
    if (requestedTab && (validTabs as readonly string[]).includes(requestedTab)) {
      this.activeTab.set(requestedTab as (typeof validTabs)[number]);
      if (requestedTab === 'audit') this.loadAuditLog();
    }
  }

  showToastFeedback(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 4000);
  }

  // --- Ayudantes del Modal de Confirmación ---
  openConfirm(title: string, msg: string, callback: () => void): void {
    this.confirmModalTitle = title;
    this.confirmModalMsg = msg;
    this.confirmActionCallback = callback;
    this.showConfirmModal.set(true);
  }

  closeConfirm(): void {
    this.showConfirmModal.set(false);
    this.confirmActionCallback = null;
  }

  executeConfirm(): void {
    if (this.confirmActionCallback) {
      this.confirmActionCallback();
    }
    this.closeConfirm();
  }

  // ================= ACCIONES DE CANALES =================
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

  // ================= AZ-026: cheatsheet de variables + selector de emojis =================
  readonly templateVariableChips = ['monitor', 'url', 'status', 'previousStatus', 'datetime', 'httpCode', 'ping', 'detail']
    .map(name => ({ name, token: `{{${name}}}` }));

  readonly emojiOptions = ['🚨', '✅', '❌', '⚠️', '🔴', '🟢', '🟡', '🕒', '📉', '📈', '🔥', '💥', '🌐', '🔒', '🔔', '📡', '🛑', '⏱️', '📊', '💡', '🚀', '👀', '📌', '🧯'];

  readonly showEmojiPicker = signal(false);
  private activeTemplateEl: HTMLInputElement | HTMLTextAreaElement | null = null;

  setActiveTemplateField(el: HTMLInputElement | HTMLTextAreaElement): void {
    this.activeTemplateEl = el;
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
    this.openConfirm(
      '¿Eliminar Canal?',
      '¿Estás seguro de eliminar este canal de alertas? Se suspenderán los reportes asociados.',
      () => {
        this.notificationService.delete(id).subscribe({
          next: () => this.showToastFeedback('Canal eliminado.')
        });
      }
    );
  }

  readonly testEventSelection: Record<string, AlertEventType> = {};

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

  // ================= ACCIONES DE VIEWERS =================
  private getEmptyViewerForm() {
    return {
      username: '',
      email: '',
      password: '',
      permissions: [] as IViewerPermission[],
      isTvSessionEnabled: false,
      asAdmin: false
    };
  }

  resetViewerForm(): void {
    this.isEditingViewer.set(false);
    this.editingViewerId = null;
    this.viewerForm = this.getEmptyViewerForm();
  }

  onPromptChangeViewerPassword(viewer: IViewer): void {
    this.viewerPasswordTarget = viewer;
    this.viewerNewPassword = '';
    this.showViewerPasswordModal.set(true);
  }

  onConfirmViewerPassword(): void {
    if (!this.viewerPasswordTarget || this.viewerNewPassword.length < 8) {
      this.showToastFeedback('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    const id = this.viewerPasswordTarget.id;
    this.http.put(`/api/v1/users/${id}/password`, { newPassword: this.viewerNewPassword }).subscribe({
      next: () => {
        this.showViewerPasswordModal.set(false);
        this.viewerPasswordTarget = null;
        this.viewerNewPassword = '';
        this.showToastFeedback('Contraseña del Viewer actualizada exitosamente.');
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al cambiar contraseña.'));
      }
    });
  }

  removeTempPermission(idx: number): void {
    this.viewerForm.permissions.splice(idx, 1);
  }

  onEditViewer(viewer: IViewer): void {
    this.isEditingViewer.set(true);
    this.editingViewerId = viewer.id;
    this.viewerForm = {
      username: (viewer as any).username || '',
      email: viewer.email || '',
      password: '',
      permissions: [...viewer.permissions],
      isTvSessionEnabled: viewer.isTvSessionEnabled,
      asAdmin: false
    };
  }

  onSaveViewer(): void {
    // Aviso de seguridad: guardar un viewer sin ningún permiso lo deja sin poder ver nada.
    if (!this.viewerForm.asAdmin && this.viewerForm.permissions.length === 0) {
      this.openConfirm(
        'Guardar sin permisos',
        'No seleccionaste ningún permiso (ni "Ver todo", ni grupos, ni monitores). Este usuario no podrá ver ningún monitor. ¿Guardar de todas formas?',
        () => this.proceedSaveViewer()
      );
      return;
    }
    this.proceedSaveViewer();
  }

  private proceedSaveViewer(): void {
    if (this.isEditingViewer() && this.editingViewerId) {
      this.userService.updatePermissions(this.editingViewerId, {
        permissions: this.viewerForm.permissions,
        isTvSessionEnabled: this.viewerForm.isTvSessionEnabled
      }).subscribe({
        next: () => {
          this.resetViewerForm();
          this.showToastFeedback('Permisos del Viewer actualizados.');
        },
        error: (err) => {
          this.showToastFeedback(extractApiErrorMessage(err, 'Error al actualizar los permisos del Viewer.'));
        }
      });
    } else if (this.viewerForm.asAdmin) {
      if (!this.viewerForm.email.trim() || !this.viewerForm.password.trim()) {
        this.showToastFeedback('El correo y la contraseña son obligatorios para crear un administrador.');
        return;
      }

      this.userService.createAdmin({
        email: this.viewerForm.email,
        password: this.viewerForm.password
      }).subscribe({
        next: () => {
          this.userService.loadAdmins().subscribe();
          this.resetViewerForm();
          this.showToastFeedback('Administrador creado exitosamente.');
        },
        error: (err) => {
          this.showToastFeedback(extractApiErrorMessage(err, 'Error al crear el administrador.'));
        }
      });
    } else {
      if (!this.viewerForm.username.trim() || !this.viewerForm.password.trim()) {
        this.showToastFeedback('El nombre de usuario y la contraseña son obligatorios.');
        return;
      }

      this.userService.createViewer({
        username: this.viewerForm.username,
        email: this.viewerForm.email || undefined,
        password: this.viewerForm.password,
        permissions: this.viewerForm.permissions,
        isTvSessionEnabled: this.viewerForm.isTvSessionEnabled
      } as any).subscribe({
        next: () => {
          this.resetViewerForm();
          this.showToastFeedback('Usuario Viewer creado exitosamente.');
        },
        error: (err) => {
          this.showToastFeedback(extractApiErrorMessage(err, 'Error al crear el Viewer.'));
        }
      });
    }
  }

  onDeleteViewer(id: string): void {
    this.openConfirm(
      '¿Eliminar Viewer?',
      '¿Estás seguro de eliminar este usuario de solo lectura? Perderá acceso inmediato a la plataforma.',
      () => {
        this.userService.deleteViewer(id).subscribe({
          next: () => this.showToastFeedback('Viewer eliminado.')
        });
      }
    );
  }

  // ================= ACCIONES DE OTROS ADMINISTRADORES (AZ-023) =================
  onEditAdmin(admin: IAdmin): void {
    this.adminEditTarget = admin;
    this.adminEditEmail = admin.email;
    this.showEditAdminModal.set(true);
  }

  onConfirmEditAdmin(): void {
    if (!this.adminEditTarget || !this.adminEditEmail.trim()) {
      this.showToastFeedback('El correo no puede estar vacío.');
      return;
    }
    this.userService.updateAdminEmail(this.adminEditTarget.id, this.adminEditEmail.trim()).subscribe({
      next: () => {
        this.showEditAdminModal.set(false);
        this.adminEditTarget = null;
        this.showToastFeedback('Correo del administrador actualizado.');
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al actualizar el correo.'));
      }
    });
  }

  onPromptResetAdminPassword(admin: IAdmin): void {
    this.adminPasswordTarget = admin;
    this.adminNewPassword = '';
    this.showAdminPasswordModal.set(true);
  }

  onConfirmResetAdminPassword(): void {
    if (!this.adminPasswordTarget || this.adminNewPassword.length < 8) {
      this.showToastFeedback('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.userService.resetAdminPassword(this.adminPasswordTarget.id, this.adminNewPassword).subscribe({
      next: () => {
        this.showAdminPasswordModal.set(false);
        this.adminPasswordTarget = null;
        this.adminNewPassword = '';
        this.showToastFeedback('Contraseña del administrador actualizada.');
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al cambiar contraseña.'));
      }
    });
  }

  onToggleAdminBlocked(admin: IAdmin): void {
    const nextState = !admin.isBlocked;
    this.openConfirm(
      nextState ? '¿Bloquear administrador?' : '¿Desbloquear administrador?',
      nextState
        ? `${admin.email} no podrá iniciar sesión mientras esté bloqueado.`
        : `${admin.email} podrá volver a iniciar sesión normalmente.`,
      () => {
        this.userService.toggleAdminBlocked(admin.id, nextState).subscribe({
          next: () => this.showToastFeedback(nextState ? 'Administrador bloqueado.' : 'Administrador desbloqueado.'),
          error: (err) => {
            this.showToastFeedback(extractApiErrorMessage(err, 'Error al cambiar el estado de bloqueo.'));
          }
        });
      }
    );
  }

  onDeleteAdmin(admin: IAdmin): void {
    this.openConfirm(
      '¿Eliminar Administrador?',
      `¿Estás seguro de eliminar la cuenta de ${admin.email}? Esta acción no se puede deshacer.`,
      () => {
        this.userService.deleteAdmin(admin.id).subscribe({
          next: () => this.showToastFeedback('Administrador eliminado.'),
          error: (err) => {
            this.showToastFeedback(extractApiErrorMessage(err, 'Error al eliminar el administrador.'));
          }
        });
      }
    );
  }

  // ================= RESPALDOS E IMPORTACIÓN =================
  backupStrategy: 'accumulate' | 'replace' = 'accumulate';
  readonly savedBackups = signal<{ id: string; strategy: string; createdAt: string }[]>([]);

  loadBackups(): void {
    this.http.get<{ id: string; strategy: string; createdAt: string }[]>('/api/v1/backup').subscribe({
      next: (data) => this.savedBackups.set(data),
      error: () => {}
    });
  }

  createBackup(): void {
    this.http.post<any>('/api/v1/backup', { strategy: this.backupStrategy }).subscribe({
      next: (res) => {
        this.fileDownload.downloadJson(res.payload, 'azkin-backup');
        this.showToastFeedback(
          this.backupStrategy === 'replace'
            ? `Respaldo creado (se reemplazaron ${res.deletedCount} anteriores).`
            : 'Respaldo creado correctamente.'
        );
        this.loadBackups();
      },
      error: () => this.showToastFeedback('Error al generar el respaldo.')
    });
  }

  downloadBackup(id: string): void {
    this.http.get(`/api/v1/backup/${id}`).subscribe({
      next: (payload) => this.fileDownload.downloadJson(payload, 'azkin-backup'),
      error: () => this.showToastFeedback('Error al descargar el respaldo.')
    });
  }

  // ================= AZ-028: Importación masiva de monitores vía CSV =================
  readonly isImportingCsv = signal(false);
  readonly csvImportResult = signal<{ createdCount: number; updatedCount: number; errors: { row: number; message: string }[] } | null>(null);

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
      '# Columnas: name | type | target | port | interval | retries | retryInterval | group | tags',
      '# Valores validos para type: http | ping | port | dns | snmp | push',
      '# http = HTTP / HTTPS | ping = Ping (ICMP) | port = Port TCP | dns = DNS Resolution',
      '# snmp = SNMP Agent | push = Push (Pasivo)',
      '# target es obligatorio salvo si type=push | port es obligatorio si type=port',
      '# dns y snmp solo traen los campos basicos por CSV: configura resolver/OID despues editando el monitor en la UI',
      '# Si un valor necesita una coma (ej. un nombre o grupo descriptivo) encierralo entre comillas dobles - ver ejemplo abajo',
      '# Las tags se separan con ; dentro de la misma celda (ej. web;produccion)',
      '# Lineas que empiezan con # son comentarios y se ignoran al importar',
      'name,type,target,port,interval,retries,retryInterval,group,tags',
      'Sitio de ejemplo,http,https://ejemplo.com,,60,0,60,General,web;produccion',
      // Si un valor necesita contener una coma (ej. un nombre o grupo descriptivo), enciérralo
      // entre comillas dobles — así no se interpreta como un separador de columna.
      '"Otro sitio, con coma en el nombre",http,https://ejemplo2.com,,60,0,60,"Produccion, Santiago",web',
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
      this.http.post<{ createdCount: number; updatedCount: number; errors: { row: number; message: string }[] }>(
        '/api/v1/monitors/bulk-import', { csv }
      ).subscribe({
        next: (result) => {
          this.isImportingCsv.set(false);
          this.csvImportResult.set(result);
          this.monitorService.loadMonitors().subscribe();
          this.showToastFeedback(`Importación completada: ${result.createdCount} creados, ${result.updatedCount} actualizados.`);
        },
        error: (err) => {
          this.isImportingCsv.set(false);
          this.showToastFeedback(extractApiErrorMessage(err, 'Error al importar el CSV.'));
        }
      });
    };
    reader.readAsText(file);
  }

  // ================= TLS / HTTPS (AZ-006) =================
  readonly tlsStatus = signal<{ configured: boolean; port?: number; httpRedirect?: boolean; validTo?: string; listenerActive: boolean } | null>(null);
  readonly isApplyingTls = signal(false);
  tlsForm = { certPem: '', keyPem: '', chainPem: '', port: 443, httpRedirect: false };

  loadTlsStatus(): void {
    this.http.get<any>('/api/v1/system/tls').subscribe({
      next: (status) => this.tlsStatus.set(status),
      error: () => {}
    });
  }

  // ================= AZ-031: SMTP de aplicación =================
  readonly smtpStatus = signal<{ configured: boolean; host?: string; port?: number; secure?: boolean } | null>(null);
  readonly isSendingTestEmail = signal(false);
  smtpTestRecipient = '';

  loadSmtpStatus(): void {
    this.http.get<{ configured: boolean; host?: string; port?: number; secure?: boolean }>('/api/v1/system/smtp').subscribe({
      next: (status) => this.smtpStatus.set(status),
      error: () => {}
    });
  }

  onSendTestEmail(): void {
    if (!this.smtpTestRecipient.trim() || !this.smtpTestRecipient.includes('@')) {
      this.showToastFeedback('Ingresa un correo destinatario válido.');
      return;
    }
    this.isSendingTestEmail.set(true);
    this.http.post<{ message: string }>('/api/v1/system/smtp/test', { recipient: this.smtpTestRecipient }).subscribe({
      next: (res) => {
        this.isSendingTestEmail.set(false);
        this.showToastFeedback(res.message);
      },
      error: (err) => {
        this.isSendingTestEmail.set(false);
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al enviar el correo de prueba.'));
      }
    });
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
      this.showToastFeedback('No se pudo leer el archivo seleccionado.');
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  applyTlsConfig(): void {
    if (!this.tlsForm.certPem.trim() || !this.tlsForm.keyPem.trim()) {
      this.showToastFeedback('El certificado y la clave privada son requeridos.');
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
        this.showToastFeedback('Configuración TLS aplicada correctamente.');
        this.loadTlsStatus();
      },
      error: (err) => {
        this.isApplyingTls.set(false);
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al aplicar la configuración TLS.'));
      }
    });
  }

  importBackup(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = JSON.parse(e.target.result);
        this.http.post('/api/v1/backup/import', data).subscribe({
          next: (res: any) => {
            this.showToastFeedback(`Importado con éxito. Nuevos: ${res.importedCount}, Actualizados: ${res.updatedCount}`);
            this.monitorService.loadMonitors().subscribe();
            event.target.value = ''; // Limpiar input file
          },
          error: (err) => {
            this.showToastFeedback(extractApiErrorMessage(err, 'Error al importar los datos en el servidor.'));
            event.target.value = '';
          }
        });
      } catch {
        this.showToastFeedback('El archivo seleccionado no es un JSON válido.');
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  // ================= API PÚBLICA (AZ-029) =================
  readonly apiKeys = signal<{ id: string; name: string; keyPrefix: string; scopes: ('read' | 'write')[]; lastUsedAt: string | null; createdAt: string; revokedAt: string | null }[]>([]);
  readonly newlyCreatedApiKey = signal<{ plainKey: string; name: string } | null>(null);
  apiKeyForm = { name: '', canWrite: false };

  loadApiKeys(): void {
    this.http.get<any[]>('/api/v1/api-keys').subscribe({
      next: (data) => this.apiKeys.set(data),
      error: () => {}
    });
  }

  onCreateApiKey(): void {
    if (!this.apiKeyForm.name.trim()) {
      this.showToastFeedback('El nombre de la key es obligatorio.');
      return;
    }
    const scopes: ('read' | 'write')[] = this.apiKeyForm.canWrite ? ['read', 'write'] : ['read'];
    this.http.post<any>('/api/v1/api-keys', { name: this.apiKeyForm.name, scopes }).subscribe({
      next: (res) => {
        this.newlyCreatedApiKey.set({ plainKey: res.plainKey, name: res.name });
        this.apiKeyForm = { name: '', canWrite: false };
        this.loadApiKeys();
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al generar la API Key.'));
      }
    });
  }

  onRevokeApiKey(id: string): void {
    this.openConfirm(
      '¿Revocar API Key?',
      'Cualquier sistema que use esta key dejará de poder autenticarse inmediatamente.',
      () => {
        this.http.delete(`/api/v1/api-keys/${id}`).subscribe({
          next: () => {
            this.showToastFeedback('API Key revocada.');
            this.loadApiKeys();
          },
          error: () => this.showToastFeedback('Error al revocar la API Key.')
        });
      }
    );
  }

  copyApiKey(key: string): void {
    navigator.clipboard.writeText(key).then(() => this.showToastFeedback('Copiada al portapapeles.'));
  }

  // ================= AUDITORÍA (AZ-030) =================
  readonly auditLogEntries = signal<AuditLogEntry[]>([]);

  loadAuditLog(): void {
    this.http.get<AuditLogEntry[]>('/api/v1/audit-log').subscribe({
      next: (data) => this.auditLogEntries.set(data),
      error: () => {}
    });
  }
}

interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetIds?: string[];
  createdAt: string;
}
