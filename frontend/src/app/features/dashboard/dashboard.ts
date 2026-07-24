// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([SVGRenderer]);
import { MonitorService, IMonitor, IHeartbeat, MonitorEvent } from '../../core/services/monitor.service';
import { FileDownloadService } from '../../core/services/file-download.service';
import { AuthService } from '../../core/services/auth.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { NotificationService } from '../../core/services/notification.service';
import { FederationService } from '../../core/services/federation.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { normalizeMonitorStatus } from '../../core/utils/monitor-status.util';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';
import { QuickStatsPanelComponent, RecentEvent } from './quick-stats-panel';
import { ConfirmService } from '../../core/services/confirm.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast';
import { DashboardNavbarComponent } from './dashboard-navbar';
import { MonitorFormComponent } from './monitor-form';
import { BadgeStatusComponent } from '../../shared/components/badge-status';
import { FederatedComparisonComponent } from '../../shared/components/federated-comparison';

type HistoryRangeOption = {
  label: string;
  durationMs: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonLoaderComponent, QuickStatsPanelComponent, ConfirmModalComponent, ToastComponent, DashboardNavbarComponent, MonitorFormComponent, BadgeStatusComponent, FederatedComparisonComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white flex flex-col font-sans transition-colors duration-300">
      <app-dashboard-navbar [isNyanCatMode]="isNyanCatMode()" (logoClick)="resetSelection()" (toggleNyanCat)="toggleNyanCat()" />

      <!-- Toast de feedback (componente compartido, ver ToastService) -->
      <app-toast />

      <!-- Main Layout: Estilo Uptime Kuma de Dos Columnas -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden">

        <!-- COLUMNA IZQUIERDA: Panel Lateral (Monitores en Árbol Colapsable) -->
        <aside class="w-full md:w-[350px] border-r border-zinc-900 bg-zinc-900/10 flex flex-col h-auto md:h-[calc(100vh-57px)] flex-shrink-0">
          <!-- Búsqueda y Botón Añadir -->
          <div class="p-4 border-b border-zinc-900 space-y-3 bg-zinc-950/20">
            @if (authService.isAdmin()) {
              <div class="flex gap-2">
                <button (click)="openCreateForm()"
                  class="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold text-xs tracking-tight transition-all active:scale-98 shadow-md flex items-center justify-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {{ lang.t('sidebar.newMonitor') }}
                </button>
                <a [routerLink]="['/settings']" [queryParams]="{ tab: 'backups' }"
                  title="Importar monitores desde un archivo CSV"
                  class="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-orange-500/40 text-zinc-400 hover:text-orange-400 transition-all shadow-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                </a>
              </div>
            }

            @if (!isKioskMode()) {
              <div class="relative">
                <input type="text" [(ngModel)]="searchQuery" [placeholder]="lang.currentLang() === 'es' ? 'Buscar por nombre o IP...' : 'Search by name or IP...'"
                  class="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder-zinc-600 focus:outline-none focus:border-orange-500 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 text-zinc-600 absolute left-2.5 top-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </div>
            }
          </div>

          <!-- Filtros Rápidos de Estado -->
          <div class="px-4 py-2 bg-zinc-950/40 border-b border-zinc-900 flex justify-between gap-1 text-[10px] font-bold text-zinc-400">
            <button (click)="statusFilter = 'ALL'" [class.text-orange-500]="statusFilter === 'ALL'">{{ lang.t('sidebar.allMonitors') }} ({{ totalMonitors() }})</button>
            <button (click)="statusFilter = 'UP'" [class.text-orange-500]="statusFilter === 'UP'">{{ lang.t('dashboard.active') }} ({{ activeCount() }})</button>
            <button (click)="statusFilter = 'DOWN'" [class.text-orange-500]="statusFilter === 'DOWN'">{{ lang.t('dashboard.down') }} ({{ downCount() }})</button>
            <button (click)="statusFilter = 'PENDING'" [class.text-orange-500]="statusFilter === 'PENDING'">{{ lang.t('dashboard.pending') }} ({{ pendingCount() }})</button>
            <button (click)="statusFilter = 'DEGRADED'" [class.text-orange-500]="statusFilter === 'DEGRADED'">Degr. ({{ degradedCount() }})</button>
            <button (click)="statusFilter = 'MAINTENANCE'" [class.text-orange-500]="statusFilter === 'MAINTENANCE'">Mant. ({{ maintenanceCount() }})</button>
          </div>

          @if (authService.isAdmin()) {
            <div class="px-4 py-1.5 bg-zinc-950/20 border-b border-zinc-900 flex items-center justify-between">
              <button (click)="toggleSelectionMode()" class="text-[10px] font-bold text-zinc-400 hover:text-orange-500 transition-colors">
                {{ selectionMode() ? 'Cancelar selección' : 'Seleccionar varios' }}
              </button>
              @if (selectionMode() && selectedMonitorIds().size > 0) {
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono text-zinc-500">{{ selectedMonitorIds().size }} seleccionados</span>
                  @if (notificationService.channels().length > 0) {
                    <select [(ngModel)]="bulkAssignChannelId"
                      class="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[9px] text-zinc-300 focus:outline-none focus:border-orange-500 max-w-[100px]"
                      title="Canal de notificación a asignar/quitar en los monitores seleccionados">
                      <option value="">Canal...</option>
                      @for (c of notificationService.channels(); track c.id) {
                        <option [value]="c.id">{{ c.name }}</option>
                      }
                    </select>
                    <button (click)="onBulkAssignNotification('add')" [disabled]="!bulkAssignChannelId"
                      class="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Asignar este canal a todos los monitores seleccionados">+ Asignar</button>
                    <button (click)="onBulkAssignNotification('remove')" [disabled]="!bulkAssignChannelId"
                      class="text-[10px] font-bold text-amber-500 hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Quitar este canal de todos los monitores seleccionados">− Quitar</button>
                  }
                  <button (click)="onBulkDelete()" class="text-[10px] font-bold text-rose-500 hover:text-rose-400 transition-colors">Eliminar</button>
                </div>
              }
            </div>
          }

          <!-- Lista de Monitores Scrollable -->
          <div class="flex-1 overflow-y-auto space-y-1 p-2">
            @if (isLoading()) {
              <div class="p-4"><app-skeleton-loader [count]="5" /></div>
            } @else {
              <!-- GRUPOS COLAPSABLES (ACORDEÓN FLAT) -->
              @for (g of groupedMonitors().groups; track g.name) {
                <div class="mb-2">
                  <!-- Cabecera del Grupo (Compacta y sin cajas) -->
                  <div (click)="selectGroup(g.name)"
                    class="flex items-center justify-between p-1.5 hover:bg-zinc-900/30 cursor-pointer select-none transition-colors rounded-lg"
                    [class.bg-zinc-900/50]="selectedGroupName() === g.name">
                    <div class="flex items-center space-x-1.5 truncate">
                      <!-- Chevron Colapsable -->
                      <button (click)="toggleGroup(g.name, $event)" class="p-0.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white" title="Expandir/Contraer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
                          [class.rotate-[-90deg]]="g.isCollapsed"
                          class="w-3 h-3 transition-transform duration-200">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <!-- Estado consolidado del grupo -->
                      <span [class]="g.status === 'UP' ? 'bg-emerald-500' : (g.status === 'DOWN' ? 'bg-rose-500 animate-pulse' : (g.status === 'DEGRADED' ? 'bg-orange-500' : (g.status === 'MAINTENANCE' ? 'bg-sky-500' : 'bg-amber-500')))"
                        class="w-2 h-2 rounded-full flex-shrink-0 shadow"></span>
                      <span class="text-xs font-black text-zinc-300 tracking-tight truncate">{{ g.name }}</span>
                    </div>
                    <span class="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md transition-colors"
                      [class]="g.uptime >= 1.0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : (g.uptime < 0.95 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')">
                      {{ (g.uptime * 100).toFixed(1) }}%
                    </span>
                  </div>

                  <!-- Hijos del Grupo (Indentación limpia, sin caja externa) -->
                  @if (!g.isCollapsed) {
                    <div class="pl-2 border-l border-zinc-800/60 ml-4.5 mt-1 space-y-0.5 animate-fade-in">
                      @for (m of g.monitors; track m.id) {
                        <div (click)="selectionMode() ? toggleMonitorSelection(m.id) : selectMonitor(m)"
                          [class]="selectedMonitorId() === m.id ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'border-transparent hover:bg-zinc-900/20 text-zinc-300'"
                          class="flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-all duration-150 group">
                          <div class="flex items-center space-x-2 truncate">
                            @if (selectionMode()) {
                              <input type="checkbox" [checked]="selectedMonitorIds().has(m.id)" (click)="$event.stopPropagation()" (change)="toggleMonitorSelection(m.id)"
                                class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                            }
                            @if (!m.isActive) {
                              <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-zinc-400 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                                PAUSED
                              </span>
                            } @else if (m.status === 'UP') {
                              <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-emerald-500/5">
                                <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                                UP
                              </span>
                            } @else if (m.status === 'DOWN') {
                              <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-rose-500/5 animate-pulse">
                                <span class="w-1 h-1 rounded-full bg-rose-400"></span>
                                DOWN
                              </span>
                            } @else if (m.status === 'DEGRADED') {
                              <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-orange-500/5">
                                <span class="w-1 h-1 rounded-full bg-orange-400"></span>
                                DEGR
                              </span>
                            } @else if (m.status === 'MAINTENANCE') {
                              <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-sky-500/5">
                                <span class="w-1 h-1 rounded-full bg-sky-400"></span>
                                MANT
                              </span>
                            } @else {
                              <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                <span class="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></span>
                                PEND
                              </span>
                            }
                            <div class="truncate flex flex-col">
                              <span class="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors truncate">{{ m.name }}</span>
                              <span class="text-[9px] text-zinc-600 truncate">{{ m.target || 'Push Activo' }}</span>
                            </div>
                          </div>
                          <span class="text-[9px] font-mono text-zinc-500 pr-1">
                            {{ m.lastPing ? m.lastPing + ' ms' : '--' }}
                          </span>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- MONITORES SIN GRUPO (Flat y Compactos) -->
              @for (m of groupedMonitors().ungrouped; track m.id) {
                <div (click)="selectionMode() ? toggleMonitorSelection(m.id) : selectMonitor(m)"
                  [class]="selectedMonitorId() === m.id ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'border-transparent hover:bg-zinc-900/20 text-zinc-300'"
                  class="flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all duration-150 group mb-1">
                  <div class="flex items-center space-x-3 truncate">
                    @if (selectionMode()) {
                      <input type="checkbox" [checked]="selectedMonitorIds().has(m.id)" (click)="$event.stopPropagation()" (change)="toggleMonitorSelection(m.id)"
                        class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                    }
                    @if (!m.isActive) {
                      <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-zinc-400 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                        PAUSED
                      </span>
                    } @else if (m.status === 'UP') {
                      <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-emerald-500/5">
                        <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                        UP
                      </span>
                    } @else if (m.status === 'DOWN') {
                      <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-rose-500/5 animate-pulse">
                        <span class="w-1 h-1 rounded-full bg-rose-400"></span>
                        DOWN
                      </span>
                    } @else if (m.status === 'DEGRADED') {
                      <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-orange-500/5">
                        <span class="w-1 h-1 rounded-full bg-orange-400"></span>
                        DEGR
                      </span>
                    } @else if (m.status === 'MAINTENANCE') {
                      <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded shadow-sm shadow-sky-500/5">
                        <span class="w-1 h-1 rounded-full bg-sky-400"></span>
                        MANT
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-0.5 text-[8px] font-black tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        <span class="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></span>
                        PEND
                      </span>
                    }
                    <div class="truncate flex flex-col">
                      <span class="text-xs font-black text-zinc-300 group-hover:text-orange-500 transition-colors truncate">{{ m.name }}</span>
                      <span class="text-[10px] text-zinc-500 truncate">{{ m.target || 'Push Activo' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-[10px] font-mono text-zinc-400">
                      {{ m.lastPing ? m.lastPing + ' ms' : '--' }}
                    </span>
                  </div>
                </div>
              }
            }
          </div>
        </aside>

         <!-- COLUMNA DERECHA: Detalle del Monitor Seleccionado o Panel de Quick Stats -->
        <main class="flex-1 bg-zinc-950 p-6 overflow-y-auto flex flex-col justify-between">
          @if (selectedMonitorId()) {
            <!-- VISTA DETALLADA DEL MONITOR -->
            <div class="space-y-6 flex-1">
              <!-- Info Header -->
              <div class="flex items-start justify-between border-b border-zinc-900 pb-5">
                <div>
                  <div class="flex items-center space-x-3">
                    @if (!selectedMonitor()?.isActive) {
                      <span class="px-3 py-1 rounded-full bg-zinc-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-zinc-700/20">
                        <span class="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                        Pausado
                      </span>
                    } @else if (selectedMonitor()?.status === 'UP') {
                      <span class="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Funcional
                      </span>
                    } @else if (selectedMonitor()?.status === 'DOWN') {
                      <span class="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-500/20 animate-pulse">
                        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                        Caído
                      </span>
                    } @else {
                      <span class="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/20">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Verificando
                      </span>
                    }
                    <h2 class="text-2xl font-black tracking-tight text-white">{{ selectedMonitor()?.name }}</h2>
                  </div>
                  <p class="text-xs text-zinc-500 mt-1">
                    Objetivo: <span class="text-zinc-400 font-semibold">{{ selectedMonitor()?.target || 'Webhook URL pasivo' }}</span>
                    @if (selectedMonitor()?.group) {
                      | Grupo: <span class="text-zinc-400 font-semibold">{{ selectedMonitor()?.group }}</span>
                    }
                  </p>
                </div>
                @if (authService.isAdmin()) {
                  <div class="flex space-x-2">
                    <!-- Botón Pausar/Reanudar -->
                    <button (click)="togglePause(selectedMonitor()!)"
                      class="p-2 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 transition-all shadow-md hover:text-white"
                      [class.hover:bg-amber-950/20]="selectedMonitor()?.isActive"
                      [class.hover:border-amber-900]="selectedMonitor()?.isActive"
                      [class.hover:bg-emerald-950/20]="!selectedMonitor()?.isActive"
                      [class.hover:border-emerald-900]="!selectedMonitor()?.isActive"
                      [title]="selectedMonitor()?.isActive ? 'Pausar Monitoreo' : 'Reanudar Monitoreo'">
                      @if (selectedMonitor()?.isActive) {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-amber-500">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-emerald-500">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                      }
                    </button>

                    @if (isMultiRegionActive()) {
                      <button (click)="toggleMultiRegionView()" aria-label="Gráfico Multi-Nodo" title="Activar/desactivar curvas comparativas Multi-Nodo"
                        [class]="showMultiRegionView() ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 border border-orange-400 font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
                        class="px-3 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.949 8.949 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        🌐 Multi-Nodo: {{ showMultiRegionView() ? 'ON' : 'OFF' }}
                      </button>
                    }

                    <button (click)="openEditForm(selectedMonitor()!)" aria-label="Editar monitor" title="Editar monitor"
                      class="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button (click)="onDelete(selectedMonitor()!.id)" aria-label="Eliminar monitor" title="Eliminar monitor"
                      class="p-2 bg-zinc-900 hover:bg-rose-950/20 border border-zinc-850 hover:border-rose-900 rounded-xl text-zinc-400 hover:text-rose-500 transition-all shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                }
              </div>

              <!-- Banner de Caída de Red Local (ISP Outage) -->
              @if (selectedMonitor()?.isLocalNetworkDown) {
                <div class="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-2xl flex items-center gap-3 animate-pulse shadow-lg shadow-amber-500/5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 shrink-0 text-amber-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <div>
                    <span class="font-bold uppercase tracking-wider text-[10px] text-amber-500 block">Diagnóstico de Enlace</span>
                    <span class="text-[11px] font-medium leading-relaxed block mt-0.5">{{ lang.t('dashboard.localOutageBanner') }}</span>
                  </div>
                </div>
              }

              <!-- Barra de Stats Compacta (Reemplaza las cajas individuales) -->
              <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-900 border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-900/20">
                <div class="p-4">
                  <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('monitor.detail.latency') }}</span>
                  <span class="text-2xl font-black text-orange-500 mt-0.5 block">
                    {{ selectedMonitor()?.lastPing ? selectedMonitor()?.lastPing + ' ms' : '--' }}
                  </span>
                </div>
                <div class="p-4">
                  <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('monitor.detail.avgLatency') }}</span>
                  <span class="text-2xl font-black text-orange-500 mt-0.5 block">
                    {{ avgPing() ? avgPing() + ' ms' : '--' }}
                  </span>
                </div>
                <div class="p-4">
                  <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('monitor.detail.uptime24h') }}</span>
                  <span class="text-2xl font-black text-orange-500 mt-0.5 block">
                    {{ selectedMonitor()?.uptime24h !== null && selectedMonitor()?.uptime24h !== undefined ? (selectedMonitor()!.uptime24h! * 100).toFixed(2) + '%' : '--' }}
                  </span>
                </div>
                <div class="p-4">
                  <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('monitor.detail.lastCheck') }}</span>
                  <span class="text-xs font-bold text-zinc-400 mt-1 block truncate">
                    {{ selectedMonitor()?.lastCheckedAt ? (selectedMonitor()!.lastCheckedAt! | date:'HH:mm:ss dd/MM') : lang.t('monitor.detail.never') }}
                  </span>
                </div>
              </div>

              <!-- Federación (AZ-049): solo se renderiza si el monitor tiene vínculos de federación activos -->
              @if (hasFederatedLinks() && showMultiRegionView()) {
                <app-federated-comparison [monitorId]="selectedMonitorId()!" />
              }

              <!-- SSL y Dominio — solo si aplica, integrados limpiamente -->
              @if (selectedMonitor()?.target?.toLowerCase()?.startsWith('https://')) {
                <div class="grid grid-cols-2 divide-x divide-zinc-900 border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-900/20">
                  <div class="p-4 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('monitor.detail.sslCert') }}</span>
                      <span class="text-xl font-black mt-0.5 block"
                        [class.text-rose-500]="(selectedMonitor()?.certExpiry ?? 999) < 15"
                        [class.text-amber-500]="(selectedMonitor()?.certExpiry ?? 999) >= 15 && (selectedMonitor()?.certExpiry ?? 999) < 30"
                        [class.text-emerald-500]="(selectedMonitor()?.certExpiry ?? 999) >= 30">
                        {{ selectedMonitor()?.certExpiry !== null && selectedMonitor()?.certExpiry !== undefined ? selectedMonitor()!.certExpiry + ' ' + lang.t('monitor.detail.days') : (selectedMonitor()?.lastCheckedAt ? lang.t('monitor.detail.unavailable') : lang.t('monitor.detail.checking')) }}
                      </span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                      [class.text-rose-500]="(selectedMonitor()?.certExpiry ?? 999) < 15"
                      [class.text-emerald-500]="(selectedMonitor()?.certExpiry ?? 999) >= 30"
                      class="w-7 h-7 text-zinc-700">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  </div>
                  <div class="p-4 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('monitor.detail.domainWhois') }}</span>
                      <span class="text-xl font-black mt-0.5 block"
                        [class.text-rose-500]="(selectedMonitor()?.domainExpiry ?? 999) < 30"
                        [class.text-amber-500]="(selectedMonitor()?.domainExpiry ?? 999) >= 30 && (selectedMonitor()?.domainExpiry ?? 999) < 60"
                        [class.text-emerald-500]="(selectedMonitor()?.domainExpiry ?? 999) >= 60">
                        {{ selectedMonitor()?.domainExpiry !== null && selectedMonitor()?.domainExpiry !== undefined ? selectedMonitor()!.domainExpiry + ' ' + lang.t('monitor.detail.days') : (selectedMonitor()?.lastCheckedAt ? lang.t('monitor.detail.unavailable') : lang.t('monitor.detail.querying')) }}
                      </span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                      [class.text-rose-500]="(selectedMonitor()?.domainExpiry ?? 999) < 30"
                      [class.text-emerald-500]="(selectedMonitor()?.domainExpiry ?? 999) >= 60"
                      class="w-7 h-7 text-zinc-700">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 3a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
                    </svg>
                  </div>
                </div>
              }

              <!-- Historial visual (Uptime Blocks Heatmap) -->
              <div class="bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-2xl space-y-3">
                <div class="flex items-center justify-between text-xs text-zinc-400">
                  <span class="font-bold">{{ lang.t('monitor.detail.historyTitle') }}</span>
                  <span class="font-mono text-emerald-500">100% {{ lang.t('monitor.detail.statusUp') }}</span>
                </div>
                <div class="flex gap-1.5 justify-between py-2">
                  @for (b of uptimeBlocks(); track $index) {
                    @if (b.isLocalNetworkDown) {
                      <div class="h-9 flex-1 rounded-md transition-all hover:scale-105 bg-zinc-700 border border-orange-500/40 shadow-sm shadow-orange-500/10 animate-pulse"
                        [title]="lang.t('monitor.detail.statusLocalDown')">
                      </div>
                    } @else {
                      <div [class]="b.status === 'UP' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : (b.status === 'DOWN' ? 'bg-rose-500 animate-pulse shadow-sm shadow-rose-500/20' : (b.status === 'DEGRADED' ? 'bg-orange-500 shadow-sm shadow-orange-500/20' : (b.status === 'MAINTENANCE' ? 'bg-sky-500 shadow-sm shadow-sky-500/20' : 'bg-zinc-800')))"
                        class="h-9 flex-1 rounded-md transition-all hover:scale-105"
                        [title]="b.status === 'UP' ? lang.t('monitor.detail.statusUp') : (b.status === 'DOWN' ? lang.t('monitor.detail.statusDown') : (b.status === 'DEGRADED' ? 'Degradado' : (b.status === 'MAINTENANCE' ? 'En mantenimiento' : lang.t('monitor.detail.noData'))))">
                      </div>
                    }
                  }
                </div>
                <div class="flex justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                  <span>{{ lang.t('monitor.detail.timeAgo30') }}</span>
                  <span>{{ lang.t('monitor.detail.timeNow') }}</span>
                </div>
              </div>

              <!-- Gráfico de Latencia -->
              <div class="bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span class="text-xs font-bold text-zinc-400">{{ lang.t('monitor.detail.latencyHistory') }}</span>
                  <div class="flex flex-wrap gap-1">
                    @for (opt of historyRangeOptions; track opt.durationMs) {
                      <button
                        (click)="setHistoryRange(opt.durationMs)"
                        class="px-2 py-1 rounded-md border text-[10px] font-black tracking-wide transition-colors"
                        [class]="selectedHistoryDurationMs() === opt.durationMs ? 'border-orange-500/50 bg-orange-500/15 text-orange-300' : 'border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300'">
                        {{ opt.label }}
                      </button>
                    }
                  </div>
                </div>
                <div #chartEl class="chart-canvas w-full h-64"></div>
              </div>

              <!-- Tabla de revisiones recientes (últimos 30 min) -->
              <div class="bg-zinc-900/20 border border-zinc-900/80 rounded-2xl overflow-hidden shadow-2xl">
                <div class="p-4 bg-zinc-900/40 border-b border-zinc-900 flex flex-wrap justify-between items-center gap-2">
                  <span class="text-xs font-black text-zinc-300 uppercase tracking-wider">Revisiones recientes (últimos 30 min)</span>
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="flex flex-wrap gap-1">
                      @for (opt of eventsExportRangeOptions; track opt.durationMs) {
                        <button
                          (click)="setExportRange(opt.durationMs)"
                          class="px-2 py-1 rounded-md border text-[10px] font-black tracking-wide transition-colors"
                          [class]="selectedExportRangeMs() === opt.durationMs ? 'border-orange-500/50 bg-orange-500/15 text-orange-300' : 'border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300'">
                          {{ opt.label }}
                        </button>
                      }
                    </div>
                    <button (click)="exportEventsTable()" [disabled]="isExportingEvents()"
                      class="text-[10px] text-orange-500 hover:text-orange-400 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:text-zinc-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      {{ isExportingEvents() ? 'Exportando...' : 'Exportar ' + selectedExportRangeLabel() + ' (CSV)' }}
                    </button>
                  </div>
                </div>
                <div class="overflow-x-auto max-h-80 overflow-y-auto">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-zinc-950/80 text-zinc-500 border-b border-zinc-900 font-bold uppercase tracking-wider">
                        <th class="p-3">Estado</th>
                        <th class="p-3">Fecha/Hora</th>
                        <th class="p-3">Mensaje</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-900/60">
                      @if (isLoadingEvents()) {
                        <tr><td colspan="3" class="p-8 text-center text-zinc-600 font-semibold">Cargando...</td></tr>
                      } @else if (eventsTableRows().length === 0) {
                        <tr><td colspan="3" class="p-8 text-center text-zinc-600 font-semibold">Sin revisiones en los últimos 30 min.</td></tr>
                      } @else {
                        @for (ev of eventsTableRows(); track $index) {
                          <tr class="hover:bg-zinc-900/20 transition-colors">
                            <td class="p-3"><app-badge-status [status]="ev.status"></app-badge-status></td>
                            <td class="p-3 text-zinc-400 font-medium">{{ ev.timestamp | date:'HH:mm:ss dd/MM/yyyy' }}</td>
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
          } @else if (selectedGroup()) {
            <!-- VISTA DETALLADA DEL GRUPO (PUNTO 3) -->
            <div class="space-y-6 flex-1 animate-fade-in">
              <div class="flex items-start justify-between border-b border-zinc-900 pb-5">
                <div>
                  <div class="flex items-center space-x-3">
                    @if (selectedGroup()?.overallStatus === 'UP') {
                      <span class="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {{ lang.t('group.detail.functional') }}
                      </span>
                    } @else if (selectedGroup()?.overallStatus === 'DOWN') {
                      <span class="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-500/20 animate-pulse">
                        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                        {{ lang.t('group.detail.incidents') }}
                      </span>
                    } @else {
                      <span class="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/20">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {{ lang.t('group.detail.checking') }}
                      </span>
                    }
                    <h2 class="text-2xl font-black tracking-tight text-white">{{ lang.t('group.detail.title') }}: {{ selectedGroup()?.group }}</h2>
                  </div>
                  <p class="text-xs text-zinc-500 mt-1">{{ lang.t('group.detail.subtitle') }}</p>
                </div>
              </div>

              <!-- Cartas de Estadísticas Consolidadas del Grupo -->
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl shadow">
                  <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('group.detail.uptime') }}</span>
                  <span class="text-2xl font-black text-orange-500 mt-1 block">
                    {{ (getGroupUptime(selectedGroup()?.group) * 100).toFixed(2) }}%
                  </span>
                </div>
                <div class="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl shadow">
                  <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('group.detail.latency') }}</span>
                  <span class="text-2xl font-black text-orange-500 mt-1 block">
                    {{ selectedGroup()?.avgPing ? selectedGroup()?.avgPing + ' ms' : '--' }}
                  </span>
                </div>
                <div class="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl shadow">
                  <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{{ lang.t('group.detail.agents') }}</span>
                  <span class="text-2xl font-black text-orange-500 mt-1 block">
                    {{ selectedGroup()?.monitors?.length ?? 0 }}
                  </span>
                </div>
              </div>

              <!-- Gráfico de Latencia Combinada del Grupo -->
              <div class="bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span class="text-xs font-bold text-zinc-400">Comparativa de Latencia de Monitores en Tiempo Real (ms)</span>
                  <div class="flex flex-wrap gap-1">
                    @for (opt of historyRangeOptions; track opt.durationMs) {
                      <button
                        (click)="setHistoryRange(opt.durationMs)"
                        class="px-2 py-1 rounded-md border text-[10px] font-black tracking-wide transition-colors"
                        [class]="selectedHistoryDurationMs() === opt.durationMs ? 'border-orange-500/50 bg-orange-500/15 text-orange-300' : 'border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300'">
                        {{ opt.label }}
                      </button>
                    }
                  </div>
                </div>
                <div #groupChartEl class="chart-canvas w-full h-80"></div>
              </div>

              <!-- Lista Grid de Monitores en el Grupo -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (m of selectedGroup()?.monitors; track m.id) {
                  <div (click)="selectMonitor(m)"
                    class="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl cursor-pointer hover:bg-zinc-900/60 transition-colors flex items-center justify-between border border-transparent hover:border-zinc-800">
                    <div class="space-y-1 truncate pr-4">
                      <span class="text-xs font-black text-zinc-200 block truncate">{{ m.name }}</span>
                      <span class="text-[10px] text-zinc-500 block truncate">{{ m.target || 'Push pasivo' }}</span>
                    </div>
                    <div class="text-right flex-shrink-0">
                      @if (m.status === 'UP') {
                        <span class="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">UP</span>
                      } @else if (m.status === 'DOWN') {
                        <span class="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse">DOWN</span>
                      } @else if (m.status === 'DEGRADED') {
                        <span class="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">DEGR</span>
                      } @else if (m.status === 'MAINTENANCE') {
                        <span class="text-[9px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">MANT</span>
                      } @else {
                        <span class="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">PEND</span>
                      }
                      <span class="text-[10px] text-zinc-500 font-mono block mt-1.5">{{ m.lastPing ? m.lastPing + ' ms' : '--' }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Tabla de revisiones recientes de todos los monitores del grupo (últimos 30 min) -->
              <div class="bg-zinc-900/20 border border-zinc-900/80 rounded-2xl overflow-hidden shadow-2xl">
                <div class="p-4 bg-zinc-900/40 border-b border-zinc-900 flex flex-wrap justify-between items-center gap-2">
                  <span class="text-xs font-black text-zinc-300 uppercase tracking-wider">Revisiones recientes (últimos 30 min)</span>
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="flex flex-wrap gap-1">
                      @for (opt of eventsExportRangeOptions; track opt.durationMs) {
                        <button
                          (click)="setExportRange(opt.durationMs)"
                          class="px-2 py-1 rounded-md border text-[10px] font-black tracking-wide transition-colors"
                          [class]="selectedExportRangeMs() === opt.durationMs ? 'border-orange-500/50 bg-orange-500/15 text-orange-300' : 'border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300'">
                          {{ opt.label }}
                        </button>
                      }
                    </div>
                    <button (click)="exportEventsTable()" [disabled]="isExportingEvents()"
                      class="text-[10px] text-orange-500 hover:text-orange-400 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:text-zinc-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      {{ isExportingEvents() ? 'Exportando...' : 'Exportar ' + selectedExportRangeLabel() + ' (CSV)' }}
                    </button>
                  </div>
                </div>
                <div class="overflow-x-auto max-h-80 overflow-y-auto">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-zinc-950/80 text-zinc-500 border-b border-zinc-900 font-bold uppercase tracking-wider">
                        <th class="p-3">Monitor</th>
                        <th class="p-3">Estado</th>
                        <th class="p-3">Fecha/Hora</th>
                        <th class="p-3">Mensaje</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-900/60">
                      @if (isLoadingEvents()) {
                        <tr><td colspan="4" class="p-8 text-center text-zinc-600 font-semibold">Cargando...</td></tr>
                      } @else if (eventsTableRows().length === 0) {
                        <tr><td colspan="4" class="p-8 text-center text-zinc-600 font-semibold">Sin revisiones en los últimos 30 min.</td></tr>
                      } @else {
                        @for (ev of eventsTableRows(); track $index) {
                          <tr class="hover:bg-zinc-900/20 transition-colors">
                            <td class="p-3 font-bold text-zinc-200">{{ ev.monitorName }}</td>
                            <td class="p-3"><app-badge-status [status]="ev.status"></app-badge-status></td>
                            <td class="p-3 text-zinc-400 font-medium">{{ ev.timestamp | date:'HH:mm:ss dd/MM/yyyy' }}</td>
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
          } @else {
            <app-quick-stats-panel [recentEvents]="recentEvents()" (refresh)="loadRecentIncidents()" (selectMonitor)="selectMonitorById($event)" />
          }

          <!-- Branding Footer -->
          <footer class="mt-6 pt-4 border-t border-zinc-900 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              <span>© 2026 AZKIN LABS</span>
              <span>Estabilidad Garantizada</span>
            </div>
            <p class="text-center text-[9px] text-zinc-700 normal-case font-normal" title="Ver LICENSE.md para el texto completo">
              Protegido bajo SSPL v1 / Licencia Comercial Requerida para Producción
            </p>
          </footer>
        </main>
      </div>

      <!-- Slide-over Formulario de Creación y Edición (componente propio) -->
      @if (showForm()) {
        <app-monitor-form [monitor]="editingMonitor()" (saved)="onMonitorSaved($event)" (cancel)="closeForm()" />
      }

      <!-- Custom Confirm Delete Monitor Modal (Punto 4) -->
      <!-- Modal de confirmacion generico (componente compartido, ver ConfirmService) -->
      <app-confirm-modal />

      <!-- Confirmación de borrado masivo con resumen de impacto (lista dinámica de nombres —
           no encaja en el modal de confirmación genérico, se mantiene como modal propio) -->
      @if (showBulkDeleteConfirm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="cancelBulkDelete()"></div>
          <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in text-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white uppercase tracking-wider">Eliminar {{ selectedMonitorIds().size }} monitores</h4>
              <p class="text-xs text-zinc-400 mt-2">Se eliminarán permanentemente los siguientes monitores y su historial:</p>
              <ul class="text-[10px] text-zinc-500 mt-2 max-h-28 overflow-y-auto text-left list-disc list-inside">
                @for (name of selectedMonitorNames(); track name) {
                  <li>{{ name }}</li>
                }
              </ul>
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="cancelBulkDelete()" class="flex-1 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all">{{ lang.t('common.cancel') }}</button>
              <button (click)="confirmBulkDelete()" class="flex-1 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold transition-all">{{ lang.t('common.delete') }}</button>
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
    @keyframes slide-in {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
    .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private static readonly HISTORY_RANGE_STORAGE_KEY = 'azkin-history-range-ms';

  private _chartEl: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('chartEl') set chartEl(el: ElementRef<HTMLDivElement> | undefined) {
    this._chartEl = el;
    if (el) {
      setTimeout(() => this.initChart(), 0);
    } else {
      this.chart?.dispose();
      this.chart = null;
    }
  }

  private _groupChartEl: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('groupChartEl') set groupChartEl(el: ElementRef<HTMLDivElement> | undefined) {
    this._groupChartEl = el;
    if (el) {
      setTimeout(() => this.initGroupChart(), 0);
    } else {
      this.groupChart?.dispose();
      this.groupChart = null;
    }
  }
  private chart: echarts.ECharts | null = null;
  private groupChart: echarts.ECharts | null = null;
  private unsubscribeHeartbeat: (() => void) | null = null;

  readonly authService = inject(AuthService);
  private readonly monitorService = inject(MonitorService);
  private readonly fileDownload = inject(FileDownloadService);
  private readonly realtimeService = inject(RealtimeService);
  readonly notificationService = inject(NotificationService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  public readonly lang = inject(LanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly federationService = inject(FederationService);

  // Estados de carga e interfaz
  readonly isLoading = signal(true);
  readonly showForm = signal(false);
  // `null` = modo creación; un monitor = modo edición. Se pasa como input a app-monitor-form.
  readonly editingMonitor = signal<IMonitor | null>(null);

  // Selección del Monitor o Grupo actual
  readonly selectedMonitor = signal<IMonitor | null>(null);
  readonly selectedMonitorId = computed(() => this.selectedMonitor()?.id ?? null);
  readonly selectedGroup = signal<any | null>(null);
  readonly selectedGroupName = computed(() => this.selectedGroup()?.group ?? null);
  readonly showMultiRegionView = signal<boolean>(true);
  readonly federatedSeriesMap = signal<Map<string, { label: string; points: [number, number | null][] }>>(new Map());
  readonly isMultiRegionActive = computed(() => {
    const instances = this.federationService.instances();
    const links = this.federationService.links();
    return instances.some((i) => i.status === 'enrolled') || links.length > 0;
  });
  readonly hasFederatedLinks = computed(() => {
    const id = this.selectedMonitorId();
    return id ? this.federationService.links().some((l) => l.localMonitorId === id) : false;
  });

  toggleMultiRegionView(): void {
    const next = !this.showMultiRegionView();
    this.showMultiRegionView.set(next);
    const monitor = this.selectedMonitor();
    if (next && monitor) {
      this.loadFederatedSeries(monitor.id);
    } else {
      this.updateChart();
    }
  }

  loadFederatedSeries(monitorId: string): void {
    this.federationService.getComparison(monitorId).subscribe({
      next: (comp) => {
        const map = new Map<string, { label: string; points: [number, number | null][] }>();
        const localPoints = this.historyPoints();

        for (const r of comp.regions) {
          let pts: [number, number | null][] = (r.history ?? []).map((h) => [new Date(h.timestamp).getTime(), h.ping]);

          // Si aún no hay historial acumulado para la región remota, proyectar su latencia sobre la línea temporal local para garantizar el gráfico
          if (pts.length < 2 && localPoints.length > 0) {
            const fallbackPing = r.ping ?? (localPoints[localPoints.length - 1]?.latency ?? 100);
            pts = localPoints.map((lp) => [new Date(lp.timestamp).getTime(), fallbackPing]);
          }

          map.set(r.federatedInstanceLabel, { label: r.federatedInstanceLabel, points: pts });
        }
        this.federatedSeriesMap.set(map);
        this.updateChart();
      },
      error: () => {
        this.federatedSeriesMap.set(new Map());
        this.updateChart();
      },
    });
  }

  // Historial de latencia del monitor seleccionado
  readonly historyPoints = signal<IHeartbeat[]>([]);
  readonly historyRangeOptions: HistoryRangeOption[] = [
    { label: '5m', durationMs: 5 * 60 * 1000 },
    { label: '30m', durationMs: 30 * 60 * 1000 },
    { label: '1h', durationMs: 60 * 60 * 1000 },
    { label: '3h', durationMs: 3 * 60 * 60 * 1000 },
    { label: '6h', durationMs: 6 * 60 * 60 * 1000 },
    { label: '12h', durationMs: 12 * 60 * 60 * 1000 },
    { label: '24h', durationMs: 24 * 60 * 60 * 1000 },
    { label: '48h', durationMs: 48 * 60 * 60 * 1000 },
    { label: '7d', durationMs: 7 * 24 * 60 * 60 * 1000 },
    { label: '30d', durationMs: 30 * 24 * 60 * 60 * 1000 },
  ];
  readonly selectedHistoryDurationMs = signal(this.getInitialHistoryDurationMs());
  groupHistoryMap = new Map<string, { name: string; points: { latency: number; timestamp: string; isLocalNetworkDown?: boolean }[] }>();

  // Tabla de eventos (revisiones individuales) del monitor/grupo seleccionado — ventana fija de
  // 30 min, independiente de la ventana del gráfico de latencia de arriba.
  private static readonly EVENTS_TABLE_WINDOW_MS = 30 * 60 * 1000;
  readonly eventsExportRangeOptions: HistoryRangeOption[] = [
    { label: '6h', durationMs: 6 * 60 * 60 * 1000 },
    { label: '12h', durationMs: 12 * 60 * 60 * 1000 },
    { label: '24h', durationMs: 24 * 60 * 60 * 1000 },
    { label: '48h', durationMs: 48 * 60 * 60 * 1000 },
  ];
  readonly selectedExportRangeMs = signal(this.eventsExportRangeOptions[0].durationMs);
  readonly eventsTableRows = signal<MonitorEvent[]>([]);
  readonly isLoadingEvents = signal(false);
  readonly isExportingEvents = signal(false);

  // Eventos/Incidentes recientes consolidado (Dashboard General)
  readonly recentEvents = signal<RecentEvent[]>([]);

  // Control colapsable de grupos en el sidebar
  readonly collapsedGroups = signal<Record<string, boolean>>({});

  // Control de tema claro/oscuro — delega en ThemeService (compartido con toda la app)
  readonly isLightTheme = this.themeService.isLightTheme;

  // Modo TV/Kiosko para sesiones isTvSessionEnabled — oculta controles no esenciales
  readonly isKioskMode = computed(() => this.authService.currentUser()?.isTvSessionEnabled ?? false);

  // Easter egg NyanCat — persistido en localStorage para máxima robustez
  readonly isNyanCatMode = signal(typeof window !== 'undefined' && localStorage.getItem('azkin-nyancat') === 'true');
  readonly nyanCatPosition = signal<{ x: number; y: number } | null>(null);
  readonly nyanCatAngle = signal(0);

  constructor() {
    this.federationService.loadInstances().subscribe();
    this.federationService.loadLinks().subscribe();
    effect(() => {
      // Registrar dependencias reactivas
      this.isNyanCatMode();
      this.isLightTheme();

      // Re-renderizar gráficos en tiempo real
      setTimeout(() => {
        if (this.chart) this.updateChart();
        if (this.groupChart) this.updateGroupChart();
      }, 50);
    });
  }

  // Selección múltiple y borrado masivo de monitores
  readonly selectionMode = signal(false);
  readonly selectedMonitorIds = signal<Set<string>>(new Set());
  readonly showBulkDeleteConfirm = signal(false);
  bulkAssignChannelId = '';
  readonly selectedMonitorNames = computed(() => {
    const ids = this.selectedMonitorIds();
    return this.monitorService.monitors().filter(m => ids.has(m.id)).map(m => m.name);
  });

  toggleSelectionMode(): void {
    this.selectionMode.update(v => !v);
    this.selectedMonitorIds.set(new Set());
  }

  toggleMonitorSelection(id: string): void {
    this.selectedMonitorIds.update(current => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  onBulkDelete(): void {
    if (this.selectedMonitorIds().size === 0) return;
    this.showBulkDeleteConfirm.set(true);
  }

  onBulkAssignNotification(action: 'add' | 'remove'): void {
    const ids = Array.from(this.selectedMonitorIds());
    if (ids.length === 0 || !this.bulkAssignChannelId) return;
    const channelName = this.notificationService.channels().find(c => c.id === this.bulkAssignChannelId)?.name ?? 'canal';

    this.monitorService.bulkAssignNotification(ids, this.bulkAssignChannelId, action).subscribe({
      next: ({ updatedCount }) => {
        this.showSuccessToast(
          action === 'add'
            ? `"${channelName}" asignado a ${updatedCount} monitor(es).`
            : `"${channelName}" quitado de ${updatedCount} monitor(es).`
        );
        this.monitorService.loadMonitors().subscribe();
      },
      error: (err) => this.showSuccessToast(extractApiErrorMessage(err, 'Error al asignar el canal de notificación.'))
    });
  }

  confirmBulkDelete(): void {
    const ids = Array.from(this.selectedMonitorIds());
    this.monitorService.bulkDelete(ids).subscribe({
      next: () => {
        this.showSuccessToast(`${ids.length} monitores eliminados.`);
        this.showBulkDeleteConfirm.set(false);
        this.selectedMonitorIds.set(new Set());
        this.selectionMode.set(false);
      },
      error: (err) => {
        this.showSuccessToast(extractApiErrorMessage(err, 'Error al eliminar los monitores.'));
        this.showBulkDeleteConfirm.set(false);
      }
    });
  }

  cancelBulkDelete(): void {
    this.showBulkDeleteConfirm.set(false);
  }

  // Bloques de disponibilidad (Uptime Blocks Heatmap)
  readonly uptimeBlocks = computed(() => {
    const points = this.historyPoints();
    const blocks: { status: 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE' | 'DEGRADED'; isLocalNetworkDown?: boolean }[] = [];

    if (points.length === 0) {
      const monitor = this.selectedMonitor();
      const defaultStatus = monitor?.status || 'PENDING';
      return Array(30).fill(null).map(() => ({ status: defaultStatus, isLocalNetworkDown: false }));
    }

    const recent = points.slice(-30);
    for (let i = 0; i < 30 - recent.length; i++) {
      blocks.push({ status: 'PENDING', isLocalNetworkDown: false });
    }
    for (const p of recent) {
      blocks.push({
        status: p.status === 'UP' ? 'UP' : (p.status === 'MAINTENANCE' ? 'MAINTENANCE' : (p.status === 'DEGRADED' ? 'DEGRADED' : 'DOWN')),
        isLocalNetworkDown: (p as any).isLocalNetworkDown ?? false
      });
    }
    return blocks;
  });

  // Latencia promedio de las últimas 24h
  readonly avgPing = computed(() => {
    const points = this.historyPoints().filter(p => p.status === 'UP' && p.latency !== null && p.latency !== undefined);
    if (points.length === 0) return 0;
    const sum = points.reduce((acc, p) => acc + (p.latency ?? 0), 0);
    return Math.round(sum / points.length);
  });

  // Filtros de búsqueda del panel lateral
  searchQuery = '';
  statusFilter = 'ALL';
  groupFilter = '';
  tagFilter = signal<string | null>(null);

  // Getters reactivos de contadores basados en el listado de monitores
  readonly totalMonitors = () => this.monitorService.monitors().length;
  readonly activeCount = () => this.monitorService.monitors().filter(m => m.isActive).length;
  readonly downCount = () => this.monitorService.monitors().filter(m => m.status === 'DOWN').length;
  readonly pendingCount = () => this.monitorService.monitors().filter(m => m.status === 'PENDING').length;
  readonly maintenanceCount = () => this.monitorService.monitors().filter(m => m.status === 'MAINTENANCE').length;
  readonly degradedCount = () => this.monitorService.monitors().filter(m => m.status === 'DEGRADED').length;

  // Listado filtrado para el panel lateral
  readonly filteredMonitors = computed(() => {
    let list = this.monitorService.monitors();

    // Búsqueda
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || (m.target && m.target.toLowerCase().includes(q)));
    }

    // Filtro por estado
    if (this.statusFilter !== 'ALL') {
      list = list.filter(m => m.status === this.statusFilter);
    }

    // Filtro por grupo
    if (this.groupFilter) {
      list = list.filter(m => m.group === this.groupFilter);
    }

    // Filtro por etiqueta
    const activeTag = this.tagFilter();
    if (activeTag) {
      list = list.filter(m => m.tags?.includes(activeTag));
    }

    return list;
  });

  // Agrupamiento jerárquico computado para el árbol colapsable del sidebar
  readonly groupedMonitors = computed(() => {
    const list = this.filteredMonitors();
    const groupsMap: Record<string, IMonitor[]> = {};
    const flatList: IMonitor[] = [];

    for (const m of list) {
      if (m.group) {
        if (!groupsMap[m.group]) {
          groupsMap[m.group] = [];
        }
        groupsMap[m.group].push(m);
      } else {
        flatList.push(m);
      }
    }

    return {
      groups: Object.entries(groupsMap).map(([name, monitors]) => {
        // Calcular uptime promedio consolidado
        const active = monitors.filter(x => x.uptime24h !== null && x.uptime24h !== undefined);
        const uptime = active.length === 0 ? 1.0 : active.reduce((sum, x) => sum + (x.uptime24h ?? 1), 0) / active.length;

        // Determinar peor estado consolidado (misma prioridad que combineStatus en el backend:
        // DOWN > DEGRADED > PENDING > MAINTENANCE > UP).
        let status: 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE' | 'DEGRADED' = 'UP';
        if (monitors.some(x => x.status === 'DOWN')) status = 'DOWN';
        else if (monitors.some(x => x.status === 'DEGRADED')) status = 'DEGRADED';
        else if (monitors.some(x => x.status === 'PENDING')) status = 'PENDING';
        else if (monitors.some(x => x.status === 'MAINTENANCE')) status = 'MAINTENANCE';

        const isCollapsed = !!this.collapsedGroups()[name];

        return { name, monitors, uptime, status, isCollapsed };
      }),
      ungrouped: flatList
    };
  });

  ngOnInit(): void {
    if (this.isKioskMode()) {
      document.body.classList.add('kiosk-mode');
    }

    this.loadData();
    this.notificationService.loadChannels().subscribe();
    this.loadRecentIncidents();

    // Conectar WebSocket y escuchar actualizaciones en tiempo real
    this.realtimeService.connect();
    this.unsubscribeHeartbeat = this.realtimeService.onHeartbeat((hb: any) => {
      this.monitorService.applyHeartbeat(hb);

      // Si estamos en la vista de Quick Stats consolidada, recargar incidentes recientes
      if (!this.selectedMonitorId()) {
        this.loadRecentIncidents();
      }

      // Si el heartbeat corresponde al monitor seleccionado, actualizar su detalle e historial
      const current = this.selectedMonitor();
      if (current && current.id === hb.monitorId) {
        const statusStr = normalizeMonitorStatus(hb.status);

        this.selectedMonitor.set({
          ...current,
          status: statusStr,
          lastPing: hb.latency ?? hb.ping,
          lastCheckedAt: hb.timestamp,
          certExpiry: hb.certExpiry !== undefined ? hb.certExpiry : current.certExpiry,
          domainExpiry: hb.domainExpiry !== undefined ? hb.domainExpiry : current.domainExpiry,
          isLocalNetworkDown: hb.isLocalNetworkDown
        });

        // Insertar el nuevo punto en el historial local para actualizar el gráfico en caliente
        const newPoint: IHeartbeat = {
          monitorId: hb.monitorId,
          status: hb.status === 1 || hb.status === 'UP' ? 'UP' : (hb.status === 3 || hb.status === 'MAINTENANCE' ? 'MAINTENANCE' : (hb.status === 4 || hb.status === 'DEGRADED' ? 'DEGRADED' : 'DOWN')),
          latency: hb.latency ?? hb.ping ?? 0,
          timestamp: hb.timestamp,
          isLocalNetworkDown: hb.isLocalNetworkDown
        };
        this.historyPoints.update(pts => this.filterPointsBySelectedRange([...pts, newPoint]));
        this.updateChart();

        this.prependEventRow({
          monitorId: hb.monitorId,
          monitorName: current.name,
          target: current.target ?? '',
          timestamp: hb.timestamp,
          status: hb.status === 1 || hb.status === 'UP' ? 'UP' : (hb.status === 3 || hb.status === 'MAINTENANCE' ? 'MAINTENANCE' : (hb.status === 4 || hb.status === 'DEGRADED' ? 'DEGRADED' : 'DOWN')),
          ping: hb.latency ?? hb.ping ?? null,
          msg: hb.msg ?? null
        });
      }

      // Si el grupo está seleccionado, actualizar la latencia y estado del monitor dentro del grupo en caliente
      const currentGroup = this.selectedGroup();
      if (currentGroup && currentGroup.monitors.some((m: any) => m.id === hb.monitorId)) {
        const updatedMonitors = currentGroup.monitors.map((m: any) => {
          if (m.id === hb.monitorId) {
            const statusStr = normalizeMonitorStatus(hb.status);

            return {
              ...m,
              status: statusStr,
              lastPing: hb.latency ?? hb.ping,
              lastCheckedAt: hb.timestamp,
              isLocalNetworkDown: hb.isLocalNetworkDown
            };
          }
          return m;
        });

        // Recalcular latencia promedio del grupo
        const upMonitors = updatedMonitors.filter((m: any) => m.lastPing !== undefined && m.lastPing !== null);
        const avgPing = upMonitors.length > 0 ? Math.round(upMonitors.reduce((sum: number, m: any) => sum + (m.lastPing ?? 0), 0) / upMonitors.length) : 0;

        // Determinar estado consolidado (misma prioridad que combineStatus en el backend)
        let groupStatus: 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE' | 'DEGRADED' = 'UP';
        if (updatedMonitors.some((x: any) => x.status === 'DOWN')) groupStatus = 'DOWN';
        else if (updatedMonitors.some((x: any) => x.status === 'DEGRADED')) groupStatus = 'DEGRADED';
        else if (updatedMonitors.some((x: any) => x.status === 'PENDING')) groupStatus = 'PENDING';
        else if (updatedMonitors.some((x: any) => x.status === 'MAINTENANCE')) groupStatus = 'MAINTENANCE';

        this.selectedGroup.set({
          ...currentGroup,
          monitors: updatedMonitors,
          avgPing,
          overallStatus: groupStatus
        });

        const updatedMonitor = updatedMonitors.find((m: any) => m.id === hb.monitorId);
        if (updatedMonitor) {
          this.prependEventRow({
            monitorId: hb.monitorId,
            monitorName: updatedMonitor.name,
            target: updatedMonitor.target ?? '',
            timestamp: hb.timestamp,
            status: hb.status === 1 || hb.status === 'UP' ? 'UP' : (hb.status === 3 || hb.status === 'MAINTENANCE' ? 'MAINTENANCE' : (hb.status === 4 || hb.status === 'DEGRADED' ? 'DEGRADED' : 'DOWN')),
            ping: hb.latency ?? hb.ping ?? null,
            msg: hb.msg ?? null
          });
        }

        // Insertar en groupHistoryMap
        const hist = this.groupHistoryMap.get(hb.monitorId);
        if (hist) {
          hist.points.push({
            latency: hb.latency ?? hb.ping ?? 0,
            timestamp: hb.timestamp,
            isLocalNetworkDown: hb.isLocalNetworkDown ?? false
          });
          // Mantener últimos 100 puntos
          if (hist.points.length > 100) hist.points.shift();
          this.updateGroupChart();
        }
      }
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('kiosk-mode');
    this.unsubscribeHeartbeat?.();
    this.realtimeService.disconnect();
    this.chart?.dispose();
    this.groupChart?.dispose();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.federationService.loadInstances().subscribe();
    this.federationService.loadLinks().subscribe();
    this.monitorService.loadMonitors().subscribe({
      next: (data) => {
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadRecentIncidents(): void {
    this.http.get<any[]>('/api/v1/stats/recent').subscribe({
      next: (data) => {
        this.recentEvents.set(data);
      }
    });
  }

  /**
   * Cambia la vista al dashboard de Quick Stats general
   */
  resetSelection(): void {
    this.selectedMonitor.set(null);
    this.selectedGroup.set(null);
    this.historyPoints.set([]);
    this.eventsTableRows.set([]);
    this.chart?.dispose();
    this.chart = null;
    this.groupChart?.dispose();
    this.groupChart = null;
    this.loadRecentIncidents();
  }

  /**
   * Selecciona un monitor por ID (utilizado al hacer click en la bitácora)
   */
  selectMonitorById(id: string): void {
    const monitor = this.monitorService.monitors().find(m => m.id === id);
    if (monitor) {
      this.selectMonitor(monitor);
    }
  }

  /**
   * Selecciona un monitor para inspeccionar sus estadísticas e inicializa su gráfico ECharts
   */
  selectMonitor(monitor: IMonitor): void {
    this.selectedGroup.set(null);
    this.groupChart?.dispose();
    this.groupChart = null;

    this.selectedMonitor.set(monitor);
    this.historyPoints.set([]);
    this.federatedSeriesMap.set(new Map());
    this.chart?.dispose();
    this.chart = null;

    // Cargar historial de latencia según la ventana de tiempo seleccionada
    this.monitorService.getHistory(monitor.id, this.selectedHistoryDurationMs()).subscribe({
      next: (res: any) => {
        if (res && res.points) {
          this.historyPoints.set(this.filterPointsBySelectedRange(res.points.map((p: any) => ({
            monitorId: monitor.id,
            status: p.status === 1 || p.status === 'UP' ? 'UP' : (p.status === 3 || p.status === 'MAINTENANCE' ? 'MAINTENANCE' : (p.status === 4 || p.status === 'DEGRADED' ? 'DEGRADED' : 'DOWN')),
            latency: p.ping ?? p.latency ?? 0,
            timestamp: p.timestamp,
            isLocalNetworkDown: p.isLocalNetworkDown ?? false
          }))));
        }
        setTimeout(() => this.initChart(), 50);
      }
    });

    if (this.showMultiRegionView()) {
      this.loadFederatedSeries(monitor.id);
    }

    this.loadEventsTableForMonitor(monitor.id);
  }

  setExportRange(durationMs: number): void {
    if (!this.eventsExportRangeOptions.some((o) => o.durationMs === durationMs)) return;
    this.selectedExportRangeMs.set(durationMs);
  }

  selectedExportRangeLabel(): string {
    return this.eventsExportRangeOptions.find((o) => o.durationMs === this.selectedExportRangeMs())?.label ?? '';
  }

  setHistoryRange(durationMs: number): void {
    if (!this.isAllowedHistoryDuration(durationMs)) return;
    if (this.selectedHistoryDurationMs() === durationMs) return;

    this.selectedHistoryDurationMs.set(durationMs);
    this.persistHistoryDuration(durationMs);
    const monitor = this.selectedMonitor();
    if (monitor) {
      this.selectMonitor(monitor);
      return;
    }

    const group = this.selectedGroup();
    if (group?.monitors?.length) {
      this.loadGroupHistory(group.monitors);
    }
  }

  /**
   * Selecciona un grupo en el sidebar y carga las estadísticas combinadas
   */
  selectGroup(groupName: string): void {
    this.selectedMonitor.set(null);
    this.historyPoints.set([]);
    this.chart?.dispose();
    this.chart = null;

    const g = this.groupedMonitors().groups.find(x => x.name === groupName);
    if (!g) return;

    const upMonitors = g.monitors.filter(m => m.lastPing !== undefined && m.lastPing !== null);
    const avgPing = upMonitors.length > 0 ? Math.round(upMonitors.reduce((sum, m) => sum + (m.lastPing ?? 0), 0) / upMonitors.length) : 0;

    this.selectedGroup.set({
      group: groupName,
      monitors: g.monitors,
      avgPing,
      overallStatus: g.status
    });

    this.loadGroupHistory(g.monitors);
    this.loadEventsTableForGroup(groupName);
  }

  getGroupUptime(groupName: string | undefined): number {
    if (!groupName) return 1.0;
    const g = this.groupedMonitors().groups.find(x => x.name === groupName);
    return g ? g.uptime : 1.0;
  }

  loadGroupHistory(monitors: IMonitor[]): void {
    this.groupHistoryMap.clear();
    this.groupChart?.dispose();
    this.groupChart = null;

    if (monitors.length === 0) return;

    let loadedCount = 0;
    monitors.forEach(m => {
      this.monitorService.getHistory(m.id, this.selectedHistoryDurationMs()).subscribe({
        next: (res: any) => {
          if (res && res.points) {
            this.groupHistoryMap.set(m.id, {
              name: m.name,
              points: res.points.map((p: any) => ({
                latency: p.ping ?? p.latency ?? 0,
                timestamp: p.timestamp,
                isLocalNetworkDown: p.isLocalNetworkDown ?? false
              }))
            });
          }
          loadedCount++;
          if (loadedCount === monitors.length) {
            setTimeout(() => this.initGroupChart(), 50);
          }
        },
        error: () => {
          loadedCount++;
          if (loadedCount === monitors.length) {
            setTimeout(() => this.initGroupChart(), 50);
          }
        }
      });
    });
  }

  /**
   * Carga la tabla de "Revisiones recientes" (últimos 30 min, fijo) para el monitor seleccionado.
   */
  loadEventsTableForMonitor(monitorId: string): void {
    this.isLoadingEvents.set(true);
    this.monitorService.getMonitorEvents(monitorId, DashboardComponent.EVENTS_TABLE_WINDOW_MS).subscribe({
      next: (rows) => {
        this.isLoadingEvents.set(false);
        this.eventsTableRows.set(rows);
      },
      error: () => this.isLoadingEvents.set(false)
    });
  }

  /**
   * Igual que `loadEventsTableForMonitor` pero para todos los monitores de un grupo.
   */
  loadEventsTableForGroup(groupName: string): void {
    this.isLoadingEvents.set(true);
    this.monitorService.getGroupEvents(groupName, DashboardComponent.EVENTS_TABLE_WINDOW_MS).subscribe({
      next: (rows) => {
        this.isLoadingEvents.set(false);
        this.eventsTableRows.set(rows);
      },
      error: () => this.isLoadingEvents.set(false)
    });
  }

  /**
   * Exporta a CSV las revisiones de la ventana elegida en `selectedExportRangeMs` (ventana
   * distinta a la tabla en pantalla, que solo muestra 30 min) del monitor o grupo seleccionado.
   */
  exportEventsTable(): void {
    const monitor = this.selectedMonitor();
    const group = this.selectedGroup();
    if (!monitor && !group) return;

    const rangeMs = this.selectedExportRangeMs();
    this.isExportingEvents.set(true);
    const request = monitor
      ? this.monitorService.getMonitorEvents(monitor.id, rangeMs)
      : this.monitorService.getGroupEvents(group!.group, rangeMs);

    request.subscribe({
      next: (rows) => {
        this.isExportingEvents.set(false);
        const label = monitor ? monitor.name : group!.group;
        this.downloadEventsCsv(rows, label);
      },
      error: () => {
        this.isExportingEvents.set(false);
        this.toast.show('Error al exportar las revisiones.');
      }
    });
  }

  private downloadEventsCsv(rows: MonitorEvent[], label: string): void {
    const escapeCsv = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
    const header = ['monitor', 'target', 'status', 'timestamp', 'ping_ms', 'message'];
    const lines = rows.map((r) => [
      escapeCsv(r.monitorName),
      escapeCsv(r.target),
      r.status,
      r.timestamp,
      r.ping !== null ? String(r.ping) : '',
      escapeCsv(r.msg ?? ''),
    ].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'monitor';
    const rangeLabel = this.selectedExportRangeLabel() || '6h';
    // Prefijo BOM UTF-8 para que Excel muestre correctamente tildes/ñ al abrir el archivo directo.
    this.fileDownload.downloadText(String.fromCharCode(0xfeff) + csv, 'text/csv;charset=utf-8', `azkin-revisiones-${safeLabel}-${rangeLabel}.csv`);
  }

  /**
   * Inserta un nuevo evento en caliente al frente de la tabla (más reciente primero) y descarta
   * los que ya quedaron fuera de la ventana fija de 30 min.
   */
  private prependEventRow(row: MonitorEvent): void {
    const cutoff = Date.now() - DashboardComponent.EVENTS_TABLE_WINDOW_MS;
    this.eventsTableRows.update(rows => [row, ...rows].filter(r => new Date(r.timestamp).getTime() >= cutoff));
  }

  private filterPointsBySelectedRange(points: IHeartbeat[]): IHeartbeat[] {
    const cutoff = Date.now() - this.selectedHistoryDurationMs();
    return points.filter((p) => new Date(p.timestamp).getTime() >= cutoff);
  }

  private isAllowedHistoryDuration(durationMs: number): boolean {
    return this.historyRangeOptions.some((o) => o.durationMs === durationMs);
  }

  private getInitialHistoryDurationMs(): number {
    const fallback = 12 * 60 * 60 * 1000;
    if (typeof window === 'undefined') return fallback;

    const raw = window.localStorage.getItem(DashboardComponent.HISTORY_RANGE_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = Number(raw);
    return this.isAllowedHistoryDuration(parsed) ? parsed : fallback;
  }

  private persistHistoryDuration(durationMs: number): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DashboardComponent.HISTORY_RANGE_STORAGE_KEY, String(durationMs));
  }

  // --- Gráficos ECharts ---
  private initChart(): void {
    if (!this._chartEl) return;
    this.chart = echarts.init(this._chartEl.nativeElement, 'dark', { renderer: 'svg' });
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.chart) return;

    const data = this.historyPoints();
    const rangeEnd = Date.now();
    const rangeStart = rangeEnd - this.selectedHistoryDurationMs();
    const isWideRange = this.selectedHistoryDurationMs() >= 24 * 60 * 60 * 1000;

    // Inyectar el símbolo de NyanCat y calcular rotación y tamaño proporcional no aplanado
    const latencies = data.map((d, index) => {
      const ts = new Date(d.timestamp).getTime();
      const val = d.latency ?? 0;
      const point: any = {
        value: [ts, val],
        isLocalNetworkDown: d.isLocalNetworkDown ?? false,
      };

      if (this.isNyanCatMode() && index === data.length - 1) {
        let angle = 0;
        if (data.length > 1) {
          const prevVal = data[index - 1].latency ?? 0;
          const diff = val - prevVal;
          // Mapear diferencia de latencia a un ángulo en grados para ECharts
          // Si el valor sube (diff > 0), el gato apunta hacia arriba. ECharts rota antihorario.
          angle = Math.max(-30, Math.min(30, diff * 0.4));
        }
        point.symbol = 'image:///nyan-cat.gif';
        point.symbolSize = [95, 58]; // Aumentado y con relación de aspecto correcta para evitar aplanarse
        point.symbolRotate = angle;
        return point;
      }

      point.symbol = 'none';
      point.symbolSize = 0;
      return point;
    });

    const seriesList: any[] = [
      {
        name: this.isNyanCatMode() ? 'Nyan Cat' : 'Este servidor (Local)',
        data: latencies,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'none',
        lineStyle: {
          width: this.isNyanCatMode() ? 5 : 2.5,
          color: this.isNyanCatMode() ? '#ec4899' : '#f97316',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: this.isNyanCatMode() ? 'rgba(236, 72, 153, 0.2)' : 'rgba(249, 115, 22, 0.2)' },
            { offset: 1, color: 'transparent' },
          ]),
        },
      },
    ];

    if (this.showMultiRegionView() && this.federatedSeriesMap().size > 0) {
      const colors = ['#06b6d4', '#a855f7', '#10b981', '#ec4899'];
      let idx = 0;
      for (const [label, dataObj] of this.federatedSeriesMap().entries()) {
        const color = colors[idx % colors.length];
        seriesList.push({
          name: label,
          data: dataObj.points,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2.5,
            color,
          },
        });
        idx++;
      }
    }

    const option = {
      backgroundColor: 'transparent',
      legend: {
        show: this.showMultiRegionView() && this.federatedSeriesMap().size > 0,
        top: 0,
        right: 20,
        textStyle: { color: '#a1a1aa', fontSize: 11 },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#18181b',
        borderColor: '#3f3f46',
        textStyle: { color: '#e4e4e7', fontSize: 11 },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          const p0 = params[0];
          const ts = Array.isArray(p0.value) ? p0.value[0] : p0.axisValue;
          const time = new Date(ts).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            ...(isWideRange ? { day: '2-digit', month: '2-digit' } : {}),
          });

          let html = `<div style="font-size:10px;color:#9ca3af;margin-bottom:6px;border-bottom:1px solid #3f3f46;padding-bottom:2px">${time}</div>`;
          params.forEach((p) => {
            const rawValue = Array.isArray(p.value) ? p.value[1] : p.value;
            const isLocalDown = !!p.data?.isLocalNetworkDown;

            let valueStr = `${rawValue} ms`;
            if (isLocalDown) {
              valueStr = `<span style="color:#f59e0b;font-weight:bold">${this.lang.t('monitor.detail.statusLocalDown')}</span>`;
            } else if (rawValue === 0 || rawValue === null) {
              valueStr = `<span style="color:#ef4444;font-weight:bold">DOWN</span>`;
            }

            html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:2px">
              <div style="display:flex;align-items:center;gap:6px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                <span style="font-weight:bold;color:#e4e4e7">${p.seriesName}:</span>
              </div>
              <span style="font-family:monospace;font-weight:bold">${valueStr}</span>
            </div>`;
          });
          return html;
        },
      },
      grid: { left: '3%', right: '3%', top: '12%', bottom: '8%', containLabel: true },
      xAxis: {
        type: 'time',
        min: rangeStart,
        max: rangeEnd,
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: {
          color: '#71717a',
          fontSize: 11,
          formatter: (value: number) =>
            new Date(value).toLocaleString([], {
              hour: '2-digit',
              minute: '2-digit',
              ...(isWideRange ? { day: '2-digit', month: '2-digit' } : {}),
            }),
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#71717a', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1c1c1e' } },
      },
      series: seriesList,
    };

    this.chart.setOption(option, true);

    // Calcular posición y rotación del NyanCat animado en el DOM
    if (this.isNyanCatMode() && data.length > 0) {
      setTimeout(() => {
        if (!this.chart) return;
        try {
          const lastIndex = data.length - 1;
          if (lastIndex < 0) return;
          const lastVal = data[lastIndex].latency ?? 0;
          const lastTs = new Date(data[lastIndex].timestamp).getTime();
          const pt = this.chart.convertToPixel({ seriesIndex: 0 }, [lastTs, lastVal]);
          if (pt && !isNaN(pt[0]) && !isNaN(pt[1])) {
            let angle = 0;
            if (data.length > 1) {
              const prevIndex = lastIndex - 1;
              const prevVal = data[prevIndex].latency ?? 0;
              const prevTs = new Date(data[prevIndex].timestamp).getTime();
              const prevPt = this.chart.convertToPixel({ seriesIndex: 0 }, [prevTs, prevVal]);
              if (prevPt) {
                const dx = pt[0] - prevPt[0];
                const dy = pt[1] - prevPt[1]; // dy en pixeles va hacia abajo (eje Y invertido en HTML vs plano cartesiano)
                angle = Math.atan2(dy, dx) * (180 / Math.PI);
              }
            }
            this.nyanCatPosition.set({ x: pt[0], y: pt[1] });
            this.nyanCatAngle.set(angle);
          }
        } catch (e) {
          console.warn('[NyanCat] Error al convertir coordenadas:', e);
        }
      }, 50);
    } else {
      this.nyanCatPosition.set(null);
    }
  }

  private initGroupChart(): void {
    if (!this._groupChartEl) return;
    this.groupChart = echarts.init(this._groupChartEl.nativeElement, 'dark', { renderer: 'svg' });
    this.updateGroupChart();
  }

  private updateGroupChart(): void {
    if (!this.groupChart) return;

    const rangeEnd = Date.now();
    const rangeStart = rangeEnd - this.selectedHistoryDurationMs();
    const isWideRange = this.selectedHistoryDurationMs() >= 24 * 60 * 60 * 1000;

    // Crear una serie para cada monitor — paleta sin rojo (rojo solo para caídas)
    const series: any[] = [];
    const colors = [
      '#f97316', // naranja (primario Azkin)
      '#3b82f6', // azul
      '#8b5cf6', // violeta
      '#ec4899', // rosa
      '#06b6d4', // cyan
      '#eab308', // amarillo
      '#a78bfa', // lavanda
      '#14b8a6', // teal
      '#f59e0b', // ámbar
      '#6366f1', // indigo
    ];

    // Función hash determinista: convierte el monitorId en un índice de color fijo.
    // Garantiza que cada monitor tenga SIEMPRE el mismo color sin depender del orden de carga.
    const getColorForId = (id: string): string => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
      }
      return colors[hash % colors.length];
    };

    for (const [monitorId, data] of this.groupHistoryMap.entries()) {
      const pointsInRange = data.points
        .map((p) => ({
          ...p,
          ts: new Date(p.timestamp).getTime(),
        }))
        .filter((p) => p.ts >= rangeStart && p.ts <= rangeEnd)
        .sort((a, b) => a.ts - b.ts);

      const latencies = pointsInRange.map((point, index) => {
        const val = point.latency;
        const item: any = {
          value: [point.ts, val],
          isLocalNetworkDown: point.isLocalNetworkDown ?? false,
        };

        // Si el modo NyanCat está activo, inyectar el GIF de NyanCat en el último punto
        if (this.isNyanCatMode() && index === pointsInRange.length - 1) {
          let angle = 0;
          if (pointsInRange.length > 1) {
            const prevPoint = pointsInRange[pointsInRange.length - 2];
            const prevVal = prevPoint ? prevPoint.latency : null;
            if (prevVal !== null && prevVal !== undefined) {
              const diff = val - prevVal;
              angle = Math.max(-30, Math.min(30, diff * 0.4));
            }
          }
          item.symbol = 'image:///nyan-cat.gif';
          item.symbolSize = [95, 58];
          item.symbolRotate = angle;
          return item;
        }

        item.symbol = 'none';
        item.symbolSize = 0;
        return item;
      });

      const lineColor = getColorForId(monitorId);

      series.push({
        name: data.name,
        data: latencies,
        type: 'line',
        smooth: true,
        showSymbol: true, // Permitir símbolos personalizados por punto
        symbol: 'none',   // No poner símbolo por defecto a nivel de serie
        connectNulls: true, // Conectar puntos aunque haya nulos
        lineStyle: { width: this.isNyanCatMode() ? 4.5 : 2.5, color: lineColor },
        // Relleno suave bajo cada línea con opacidad del 15% fija
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: lineColor + '26' }, // Hexadecimal con alfa transparente (26 = 15%)
            { offset: 1, color: 'transparent' }
          ]),
          opacity: 0.3
        },
        markPoint: {
          // Marcar los puntos donde el valor es 0 (posible caída) con un símbolo distinto
          data: latencies
            .map((v: any, idx) => {
              const val = Array.isArray(v?.value) ? v.value[1] : v?.value;
              const ts = Array.isArray(v?.value) ? v.value[0] : null;
              return val === 0 && ts !== null ? { coord: [ts, 0] } : null;
            })
            .filter(Boolean)
            .slice(0, 5) as any[]
        }
      });
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#18181b',
        borderColor: '#3f3f46',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: '#e4e4e7', fontSize: 11 },
        formatter: (params: any[]) => {
          const firstTs = Array.isArray(params[0]?.value) ? params[0].value[0] : params[0]?.axisValue;
          const time = new Date(firstTs).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            ...(isWideRange ? { day: '2-digit', month: '2-digit' } : {}),
          });
          const rows = params.map(p => {
            const rawVal = Array.isArray(p.value) ? p.value[1] : p.value;
            const isLocalDown = !!p.data?.isLocalNetworkDown;

            const val = isLocalDown ? `<span style="color:#f59e0b;font-weight:bold">${this.lang.t('monitor.detail.statusLocalDown')}</span>` :
              (rawVal == null ? '<span style="color:#6b7280">Sin datos</span>' :
              rawVal === 0 ? '<span style="color:#ef4444">⚠ Caído</span>' :
              `${rawVal} ms`);

            return `<div style="display:flex;justify-content:space-between;gap:16px;line-height:1.8">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}</span>
              <span style="font-weight:700">${val}</span>
            </div>`;
          }).join('');
          return `<div style="font-size:10px;color:#9ca3af;margin-bottom:4px">${time}</div>${rows}`;
        }
      },
      legend: {
        data: series.map(s => s.name),
        textStyle: { color: '#e4e4e7', fontSize: 13, fontWeight: 'bold' },
        bottom: '0%',
        icon: 'roundRect',
        itemWidth: 26,
        itemHeight: 8,
        itemGap: 16
      },
      grid: { left: '3%', right: '3%', top: '8%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'time',
        min: rangeStart,
        max: rangeEnd,
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: {
          color: '#71717a',
          fontSize: 12,
          formatter: (value: number) => new Date(value).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            ...(isWideRange ? { day: '2-digit', month: '2-digit' } : {}),
          }),
        },
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { color: '#71717a', fontSize: 12, formatter: (v: number) => `${v}ms` },
        splitLine: { lineStyle: { color: '#27272a' } },
      },
      series
    };

    this.groupChart.setOption(option);
  }

  // --- Filtros ---
  toggleTag(tag: string): void {
    if (this.tagFilter() === tag) {
      this.tagFilter.set(null);
    } else {
      this.tagFilter.set(tag);
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.groupFilter = '';
    this.tagFilter.set(null);
  }

  // --- Colapsado de Grupos en Sidebar ---
  toggleGroup(groupName: string, event: MouseEvent): void {
    event.stopPropagation();
    this.collapsedGroups.update(map => ({
      ...map,
      [groupName]: !map[groupName]
    }));
  }

  // --- Apertura/cierre del formulario de monitor (app-monitor-form vive solo mientras showForm() es true) ---
  openCreateForm(): void {
    this.editingMonitor.set(null);
    this.showForm.set(true);
  }

  openEditForm(monitor: IMonitor): void {
    this.editingMonitor.set(monitor);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  /** El monitor creado/actualizado que emite app-monitor-form al guardar exitosamente. */
  onMonitorSaved(monitor: IMonitor): void {
    this.showForm.set(false);
    if (this.editingMonitor()) {
      this.selectedMonitor.set(monitor);
      this.showSuccessToast('Monitor actualizado con éxito.');
    } else {
      this.selectMonitor(monitor);
      this.showSuccessToast('Monitor creado y agendado con éxito.');
    }
    this.loadRecentIncidents();
  }

  showSuccessToast(msg: string): void {
    this.toast.show(msg);
  }

  togglePause(monitor: IMonitor): void {
    const newActiveState = !monitor.isActive;
    this.monitorService.update(monitor.id, { isActive: newActiveState }).subscribe({
      next: (updated) => {
        // monitorService.update() ya normaliza `status` — no hay necesidad de rederivarlo aquí.
        this.selectedMonitor.set(updated);
        this.showSuccessToast(newActiveState ? 'Monitoreo reanudado con éxito.' : 'Monitoreo pausado con éxito.');
      },
      error: () => this.showSuccessToast('Error al cambiar el estado del monitoreo.')
    });
  }

  onDelete(id: string): void {
    this.confirm.ask(this.lang.t('monitor.modal.deleteTitle'), this.lang.t('monitor.modal.deleteMsg'), () => {
      this.monitorService.delete(id).subscribe({
        next: () => {
          this.showSuccessToast('Monitor eliminado correctamente.');
          this.selectedMonitor.set(null);
          this.loadData();
          this.loadRecentIncidents();
        }
      });
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  toggleNyanCat(): void {
    const newValue = !this.isNyanCatMode();
    this.isNyanCatMode.set(newValue);
    localStorage.setItem('azkin-nyancat', String(newValue));

    // Intentar guardar en backend, pero el origen local prevalece
    this.http.put('/api/v1/users/preferences', { nyanCatMode: newValue }).subscribe({
      next: () => {
        const current = this.authService.currentUser() as any;
        if (current) {
          const updated = {
            ...current,
            preferences: { ...(current.preferences || {}), nyanCatMode: newValue }
          };
          this.authService.currentUser.set(updated);
        }
      },
      error: () => {}
    });

    this.showSuccessToast(newValue ? '🌈 NyanCat Mode activado!' : '🐱 NyanCat Mode desactivado.');
  }
}
