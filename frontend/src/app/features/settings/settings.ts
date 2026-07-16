import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService, IViewer, IViewerPermission } from '../../core/services/user.service';
import { NotificationService, INotificationChannel } from '../../core/services/notification.service';
import { MonitorService } from '../../core/services/monitor.service';
import { LanguageService } from '../../core/services/language.service';

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
        <button (click)="lang.toggleLanguage()" class="text-zinc-400 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-950/40 text-[10px] font-black uppercase tracking-wider" [title]="lang.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'">
          {{ lang.currentLang() }}
        </button>
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
          <button (click)="activeTab.set('profile')" 
            [class]="activeTab() === 'profile' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'" 
            class="transition-all relative z-10 px-1">
            {{ lang.t('settings.tabProfile') }}
          </button>
          <button (click)="activeTab.set('backups')" 
            [class]="activeTab() === 'backups' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'" 
            class="transition-all relative z-10 px-1">
            {{ lang.t('settings.tabBackups') }}
          </button>
        </div>

        <div class="pt-2 animate-fade-in">
          
          <!-- ================= PESTAÑA: CANALES DE ALERTA ================= -->
          @if (activeTab() === 'alerts') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Formulario de canal -->
              <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg h-fit">
                <div class="p-6 space-y-4">
                  <div>
                    <h3 class="text-sm font-bold text-white tracking-tight">{{ isEditingChannel() ? lang.t('settings.alerts.editChannel') : lang.t('settings.alerts.newChannel') }}</h3>
                    <p class="text-[11px] text-zinc-500 mt-0.5">{{ lang.t('settings.alerts.channelDesc') }}</p>
                  </div>
                  
                  <div class="space-y-4 pt-2">
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

                    <!-- Configs dinámicas según tipo -->
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
              <div class="col-span-2 space-y-4">
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
                        
                        <div class="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] font-bold">
                          <button (click)="onTestChannel(c.id)" class="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                            {{ lang.t('settings.alerts.testChannel') }}
                          </button>
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
                    }

                    <div class="flex items-center gap-2 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
                      <input type="checkbox" [(ngModel)]="viewerForm.isTvSessionEnabled" id="isTvSessionEnabled" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                      <label for="isTvSessionEnabled" class="text-[11px] text-zinc-300 font-semibold cursor-pointer">{{ lang.t('settings.viewers.extSession') }}</label>
                    </div>

                    <!-- Permisos Granulares -->
                    <div class="space-y-3 border-t border-zinc-850 pt-4">
                      <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{{ lang.t('settings.viewers.granularPerms') }}</span>
                      
                      <div class="flex gap-2">
                        <select [(ngModel)]="tempPermissionType" class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500">
                          <option value="all">{{ lang.t('settings.viewers.viewAll') }}</option>
                          <option value="group">{{ lang.t('settings.viewers.viewGroup') }}</option>
                          <option value="monitor">{{ lang.t('settings.viewers.viewMonitor') }}</option>
                        </select>
                        <button (click)="addTempPermission()" class="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white transition-colors">{{ lang.t('settings.viewers.addPerm') }}</button>
                      </div>

                      @if (tempPermissionType === 'group') {
                        <select [(ngModel)]="tempPermissionValue" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 animate-fade-in">
                          <option value="">{{ lang.t('settings.viewers.selectGroup') }}</option>
                          @for (g of uniqueGroups(); track g) {
                            <option [value]="g">{{ g }}</option>
                          }
                        </select>
                      }
                      @if (tempPermissionType === 'monitor') {
                        <select [(ngModel)]="tempPermissionValue" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 animate-fade-in">
                          <option value="">{{ lang.t('settings.viewers.selectMonitor') }}</option>
                          @for (m of monitorService.monitors(); track m.id) {
                            <option [value]="m.id">{{ m.name }}</option>
                          }
                        </select>
                      }

                      <!-- Permisos añadidos -->
                      <div class="space-y-1.5 mt-2 max-h-32 overflow-y-auto pr-1">
                        @for (p of viewerForm.permissions; track $index) {
                          <div class="flex items-center justify-between bg-zinc-950/80 border border-zinc-850 px-3 py-2 rounded-lg text-[10px] animate-fade-in">
                            <div class="flex items-center gap-2">
                              <span class="text-orange-500 uppercase tracking-widest text-[8px] font-black bg-orange-500/10 px-1 py-0.5 rounded">{{ p.type }}</span>
                              <span class="text-zinc-300 font-mono font-semibold">{{ p.value || 'Todo' }}</span>
                            </div>
                            <button (click)="removeTempPermission($index)" class="text-rose-500 hover:text-rose-400 font-bold">{{ lang.t('settings.alerts.delete') }}</button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
                  @if (isEditingViewer()) {
                    <button (click)="resetViewerForm()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">{{ lang.t('settings.viewers.cancel') }}</button>
                  }
                  <button (click)="onSaveViewer()" class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
                    {{ isEditingViewer() ? lang.t('settings.viewers.updateBtn') : lang.t('settings.viewers.createBtn') }}
                  </button>
                </div>
              </div>

              <!-- Listado de Viewers -->
              <div class="col-span-2 space-y-4">
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
                              @for (p of v.permissions; track $index) {
                                <span class="text-[9px] bg-zinc-950 border border-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-medium">
                                  {{ p.type === 'all' ? lang.t('settings.viewers.viewAllShort') : p.value }}
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

          <!-- ================= PESTAÑA: MI PERFIL ================= -->
          @if (activeTab() === 'profile') {
            <div class="max-w-xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
              <div class="p-6 space-y-6">
                <div>
                  <h3 class="text-sm font-bold text-white tracking-tight">{{ lang.t('settings.profile.changeTitle') }}</h3>
                  <p class="text-[11px] text-zinc-500 mt-0.5">{{ lang.t('settings.profile.changeDesc') }}</p>
                </div>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.profile.newPass') }}</label>
                    <input type="password" [(ngModel)]="profileForm.newPassword" [placeholder]="lang.t('settings.viewers.minChars')"
                      class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.profile.confirmPass') }}</label>
                    <input type="password" [(ngModel)]="profileForm.confirmPassword" placeholder="••••••••"
                      class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                  </div>
                </div>
              </div>
              
              <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end">
                <button (click)="onChangeOwnPassword()" class="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
                  {{ lang.t('settings.profile.saveBtn') }}
                </button>
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
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button (click)="exportBackup()"
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
              </div>
            </div>
          }
        </div>
      </main>

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
  readonly userService = inject(UserService);
  readonly notificationService = inject(NotificationService);
  readonly monitorService = inject(MonitorService);
  public readonly lang = inject(LanguageService);

  readonly toast = signal<string | null>(null);
  readonly activeTab = signal<'alerts' | 'viewers' | 'profile' | 'backups'>('alerts');

  // --- Formulario de Canales ---
  readonly isEditingChannel = signal(false);
  editingChannelId: string | null = null;
  channelForm = this.getEmptyChannelForm();

  // --- Formulario de Viewers ---
  readonly isEditingViewer = signal(false);
  editingViewerId: string | null = null;
  viewerForm = this.getEmptyViewerForm();

  // --- Formulario de Perfil (Cambio de contraseña propia) ---
  profileForm = { newPassword: '', confirmPassword: '' };

  // --- Modal de Cambio de Contraseña de Viewer ---
  readonly showViewerPasswordModal = signal(false);
  viewerPasswordTarget: IViewer | null = null;
  viewerNewPassword = '';

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

  // Variables auxiliares para añadir permisos al array temporal
  tempPermissionType: 'all' | 'group' | 'monitor' = 'all';
  tempPermissionValue = '';

  ngOnInit(): void {
    this.userService.loadViewers().subscribe();
    this.notificationService.loadChannels().subscribe();
    this.monitorService.loadMonitors().subscribe();
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
      smtpFrom: ''
    };
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
      smtpFrom: channel.config['smtpFrom'] || ''
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
      isActive: true
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

  onTestChannel(id: string): void {
    this.showToastFeedback('Enviando notificación de prueba...');
    this.notificationService.testChannel(id).subscribe({
      next: (res) => this.showToastFeedback(res.message || 'Prueba enviada correctamente.'),
      error: (err) => this.showToastFeedback(err?.error?.error?.message || 'Error al enviar la prueba.')
    });
  }

  // ================= ACCIONES DE VIEWERS =================
  private getEmptyViewerForm() {
    return {
      username: '',
      email: '',
      password: '',
      permissions: [] as IViewerPermission[],
      isTvSessionEnabled: false
    };
  }

  resetViewerForm(): void {
    this.isEditingViewer.set(false);
    this.editingViewerId = null;
    this.viewerForm = this.getEmptyViewerForm();
    this.tempPermissionType = 'all';
    this.tempPermissionValue = '';
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
        this.showToastFeedback(err?.error?.error || 'Error al cambiar contraseña.');
      }
    });
  }

  onChangeOwnPassword(): void {
    const { newPassword, confirmPassword } = this.profileForm;
    if (!newPassword || newPassword.length < 8) {
      this.showToastFeedback('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.showToastFeedback('Las contraseñas no coinciden.');
      return;
    }
    this.http.put('/api/v1/users/profile/password', { newPassword }).subscribe({
      next: () => {
        this.profileForm = { newPassword: '', confirmPassword: '' };
        this.showToastFeedback('Contraseña actualizada exitosamente.');
      },
      error: (err) => {
        this.showToastFeedback(err?.error?.error || 'Error al cambiar contraseña.');
      }
    });
  }

  addTempPermission(): void {
    const p: IViewerPermission = {
      type: this.tempPermissionType,
      value: this.tempPermissionType !== 'all' ? this.tempPermissionValue : undefined
    };
    this.viewerForm.permissions.push(p);
    this.tempPermissionValue = '';
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
      isTvSessionEnabled: viewer.isTvSessionEnabled
    };
  }

  onSaveViewer(): void {
    if (this.isEditingViewer() && this.editingViewerId) {
      this.userService.updatePermissions(this.editingViewerId, {
        permissions: this.viewerForm.permissions,
        isTvSessionEnabled: this.viewerForm.isTvSessionEnabled
      }).subscribe({
        next: () => {
          this.resetViewerForm();
          this.showToastFeedback('Permisos del Viewer actualizados.');
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
          this.showToastFeedback(err?.error?.error?.message || 'Error al crear el Viewer.');
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

  // ================= RESPALDOS E IMPORTACIÓN =================
  exportBackup(): void {
    this.http.get('/api/v1/backup/export').subscribe({
      next: (data) => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azkin-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToastFeedback('Respaldo descargado correctamente.');
      },
      error: () => this.showToastFeedback('Error al exportar respaldo.')
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
            this.showToastFeedback(err?.error?.error?.message || 'Error al importar los datos en el servidor.');
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
}
