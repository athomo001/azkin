// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../core/services/monitor.service';
import { LanguageService } from '../../core/services/language.service';
import { BadgeStatusComponent } from '../../shared/components/badge-status';
import { MonitorStatusStr } from '../../core/utils/monitor-status.util';

export interface RecentEvent {
  monitorId: string;
  monitorName: string;
  target: string;
  status: MonitorStatusStr;
  timestamp: string;
  msg?: string | null;
  ping?: number | null;
}

/**
 * Panel de "Quick Stats" general del dashboard — KPIs (UP/DOWN/PENDING/TOTAL), banner de caída
 * global y bitácora de incidentes recientes. Se muestra cuando no hay un monitor ni un grupo
 * seleccionado. Extraido de dashboard.ts.
 *
 * `recentEvents` se recibe como input (en vez de cargarse aquí mismo) porque el shell lo
 * refresca también desde el handler de heartbeats en tiempo real — esa parte permanece en el
 * shell por ahora (ver nota "Fuera de alcance" en ISSUES.md).
 */
@Component({
  selector: 'app-quick-stats-panel',
  standalone: true,
  imports: [CommonModule, BadgeStatusComponent],
  template: `
    <div class="space-y-6 flex-1">
      <div>
        <h2 class="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          <span>{{ lang.t('dashboard.title') }}</span>
        </h2>
        <p class="text-xs text-zinc-500 mt-1">{{ lang.t('dashboard.subtitle') }}</p>
      </div>

      <!-- Banner Global de Caída de Red Local (ISP Outage) -->
      @if (isAnyMonitorLocalNetworkDown()) {
        <div class="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-2xl flex items-center gap-3 animate-pulse shadow-lg shadow-amber-500/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 shrink-0 text-amber-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <span class="font-bold uppercase tracking-wider text-[10px] text-amber-500 block">Diagnóstico de Servidor</span>
            <span class="text-[11px] font-medium leading-relaxed block mt-0.5">{{ lang.t('dashboard.localOutageBanner') }}</span>
          </div>
        </div>
      }

      <!-- Grid de Stats Consolidados -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{{ lang.t('dashboard.statUp') }}</span>
            <span class="text-3xl font-black text-emerald-500 mt-1 block">{{ activeCount() }}</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
        </div>
        <div class="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{{ lang.t('dashboard.statDown') }}</span>
            <span class="text-3xl font-black text-rose-500 mt-1 block">{{ downCount() }}</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse"></span>
        </div>
        <div class="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{{ lang.t('dashboard.statPending') }}</span>
            <span class="text-3xl font-black text-amber-500 mt-1 block">{{ pendingCount() }}</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></span>
        </div>
        <div class="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{{ lang.t('dashboard.statTotal') }}</span>
            <span class="text-3xl font-black text-zinc-400 mt-1 block">{{ totalMonitors() }}</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full bg-zinc-600 shadow-lg"></span>
        </div>
      </div>

      <!-- Tabla de Incidentes/Eventos Recientes -->
      <div class="bg-zinc-900/20 border border-zinc-900/80 rounded-2xl overflow-hidden shadow-2xl">
        <div class="p-4 bg-zinc-900/40 border-b border-zinc-900 flex justify-between items-center">
          <span class="text-xs font-black text-zinc-300 uppercase tracking-wider">{{ lang.t('dashboard.incidentLog') }}</span>
          <button (click)="refresh.emit()" class="text-[10px] text-zinc-500 hover:text-white font-bold flex items-center gap-1.5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {{ lang.t('dashboard.refresh') }}
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-zinc-950/80 text-zinc-500 border-b border-zinc-900 font-bold uppercase tracking-wider">
                <th class="p-3">{{ lang.t('dashboard.colMonitor') }}</th>
                <th class="p-3">{{ lang.t('dashboard.colStatus') }}</th>
                <th class="p-3">{{ lang.t('dashboard.colDatetime') }}</th>
                <th class="p-3">{{ lang.t('dashboard.colMessage') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-900/60">
              @if (recentEvents().length === 0) {
                <tr>
                  <td colspan="4" class="p-8 text-center text-zinc-600 font-semibold">
                    {{ lang.t('dashboard.noEvents') }}
                  </td>
                </tr>
              } @else {
                @for (ev of recentEvents(); track $index) {
                  <tr class="hover:bg-zinc-900/20 transition-colors">
                    <td class="p-3 font-bold text-zinc-200">
                      <span (click)="selectMonitor.emit(ev.monitorId)" class="cursor-pointer hover:underline hover:text-emerald-500">{{ ev.monitorName }}</span>
                      <span class="text-[10px] text-zinc-500 font-normal block">{{ ev.target }}</span>
                    </td>
                    <td class="p-3">
                      <app-badge-status [status]="ev.status"></app-badge-status>
                    </td>
                    <td class="p-3 text-zinc-400 font-medium">
                      {{ ev.timestamp | date:'HH:mm:ss dd/MM/yyyy' }}
                    </td>
                    <td class="p-3 font-mono text-zinc-500 text-[11px] truncate max-w-xs" [title]="ev.msg || ''">
                      {{ ev.msg || 'OK' }} ({{ ev.ping !== null ? ev.ping + 'ms' : 'N/A' }})
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class QuickStatsPanelComponent {
  private readonly monitorService = inject(MonitorService);
  public readonly lang = inject(LanguageService);

  readonly recentEvents = input.required<RecentEvent[]>();
  readonly refresh = output<void>();
  readonly selectMonitor = output<string>();

  readonly totalMonitors = computed(() => this.monitorService.monitors().length);
  readonly activeCount = computed(() => this.monitorService.monitors().filter(m => m.isActive).length);
  readonly downCount = computed(() => this.monitorService.monitors().filter(m => m.status === 'DOWN').length);
  readonly pendingCount = computed(() => this.monitorService.monitors().filter(m => m.status === 'PENDING').length);
  readonly isAnyMonitorLocalNetworkDown = computed(() => this.monitorService.monitors().some(m => m.isLocalNetworkDown));
}
