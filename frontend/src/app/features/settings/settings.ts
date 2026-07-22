// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MonitorService } from '../../core/services/monitor.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal';
import { ToastComponent } from '../../shared/components/toast';
import { TlsPanelComponent } from './tls-panel';
import { AuditLogPanelComponent } from './audit-log-panel';
import { ApiKeysPanelComponent } from './api-keys-panel';
import { BackupsPanelComponent } from './backups-panel';
import { ViewersPanelComponent } from './viewers-panel';
import { AlertsPanelComponent } from './alerts-panel';
import { MaintenancePanelComponent } from './maintenance-panel';
import { ReportsPanelComponent } from './reports-panel';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmModalComponent, ToastComponent, TlsPanelComponent, AuditLogPanelComponent, ApiKeysPanelComponent, BackupsPanelComponent, ViewersPanelComponent, AlertsPanelComponent, MaintenancePanelComponent, ReportsPanelComponent],
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

      <!-- Toast de feedback (componente compartido, ver ToastService) -->
      <app-toast />

      <main class="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
        
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
          <button (click)="activeTab.set('maintenance')"
            [class]="activeTab() === 'maintenance' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'"
            class="transition-all relative z-10 px-1">
            Mantenimiento
          </button>
          <button (click)="activeTab.set('reports')"
            [class]="activeTab() === 'reports' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'"
            class="transition-all relative z-10 px-1">
            Informes
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
          <button (click)="activeTab.set('audit')"
            [class]="activeTab() === 'audit' ? 'border-b-2 border-orange-500 text-white font-bold pb-3 -mb-[2px]' : 'text-zinc-400 hover:text-zinc-200 pb-3 -mb-[2px] transition-colors'"
            class="transition-all relative z-10 px-1">
            Auditoría
          </button>
        </div>

        <div class="pt-2 animate-fade-in">
          
          <!-- ================= PESTAÑA: CANALES DE ALERTA ================= -->
          @if (activeTab() === 'alerts') {
            <app-alerts-panel />
          }

          <!-- ================= PESTAÑA: VIEWERS / USUARIOS ================= -->
          @if (activeTab() === 'viewers') {
            <app-viewers-panel />
          }

          <!-- ================= PESTAÑA: RESPALDOS ================= -->
          @if (activeTab() === 'backups') {
            <app-backups-panel />
          }

          <!-- ================= PESTAÑA: MANTENIMIENTO ================= -->
          @if (activeTab() === 'maintenance') {
            <app-maintenance-panel />
          }

          <!-- ================= PESTAÑA: INFORMES ================= -->
          @if (activeTab() === 'reports') {
            <app-reports-panel />
          }

          <!-- ================= PESTAÑA: TLS / SISTEMA ================= -->
          @if (activeTab() === 'tls') {
            <app-tls-panel />
          }

          <!-- ================= PESTAÑA: API PÚBLICA ================= -->
          @if (activeTab() === 'api') {
            <app-api-keys-panel />
          }

          <!-- ================= PESTAÑA: AUDITORÍA ================= -->
          @if (activeTab() === 'audit') {
            <app-audit-log-panel />
          }
        </div>

        <footer class="pt-6 mt-6 border-t border-zinc-900">
          <p class="text-center text-[9px] text-zinc-700" title="Ver LICENSE.md para el texto completo">
            Protegido bajo SSPL v1 / Licencia Comercial Requerida para Producción
          </p>
        </footer>
      </main>

      <!-- Modal de confirmacion generico (componente compartido, ver ConfirmService) -->
      <app-confirm-modal />
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
  private readonly route = inject(ActivatedRoute);
  private readonly monitorService = inject(MonitorService);
  public readonly lang = inject(LanguageService);
  public readonly themeService = inject(ThemeService);

  readonly activeTab = signal<'alerts' | 'viewers' | 'backups' | 'maintenance' | 'reports' | 'tls' | 'api' | 'audit'>('alerts');

  ngOnInit(): void {
    // Estado compartido leido por varios paneles (Viewers, Backups) — se carga aqui, a nivel de
    // orquestador, en vez de en cada panel por separado.
    this.monitorService.loadMonitors().subscribe();

    const requestedTab = this.route.snapshot.queryParamMap.get('tab');
    const validTabs = ['alerts', 'viewers', 'backups', 'maintenance', 'reports', 'tls', 'api', 'audit'] as const;
    if (requestedTab && (validTabs as readonly string[]).includes(requestedTab)) {
      this.activeTab.set(requestedTab as (typeof validTabs)[number]);
    }
  }
}
