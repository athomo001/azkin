// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, ElementRef, ViewChild, effect, inject, input, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import { FederationService, IFederatedComparisonResult } from '../../core/services/federation.service';
import { BadgeStatusComponent } from './badge-status';

type MonitorStatusLabel = 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE' | 'DEGRADED';

function statusLabel(status: number | null): MonitorStatusLabel {
  switch (status) {
    case 0: return 'DOWN';
    case 1: return 'UP';
    case 3: return 'MAINTENANCE';
    case 4: return 'DEGRADED';
    default: return 'PENDING';
  }
}

/**
 * Componente de Comparación Visual Multi-Nodo (AZ-049 / AZ-050).
 * Muestra el gráfico comparativo en tiempo real con las curvas de latencia de cada nodo federado
 * simultáneamente en el mismo eje de tiempo.
 */
@Component({
  selector: 'app-federated-comparison',
  standalone: true,
  imports: [CommonModule, BadgeStatusComponent],
  template: `
    @if (result() && (result()!.regions.length > 0 || hasData())) {
      <div class="bg-zinc-900/30 border border-orange-500/30 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
        <!-- Cabecera del Gráfico Multi-Nodo -->
        <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.949 8.949 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Comparativa Latencia Multi-Nodo
                <span class="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-mono">
                  {{ 1 + result()!.regions.length }} Nodos Activos
                </span>
              </h4>
              <p class="text-[10px] text-zinc-500 mt-0.5">Monitoreo distribuido simultáneo en el mismo gráfico</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex gap-1 bg-zinc-950/80 rounded-xl p-1 border border-zinc-800">
              <button (click)="view.set('region')"
                [class]="view() === 'region' ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'"
                class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">Por Nodo</button>
              <button (click)="view.set('combined')"
                [class]="view() === 'combined' ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'"
                class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">Estado Combinado</button>
            </div>
          </div>
        </div>

        <!-- Contenedor del Gráfico ECharts Multi-Línea -->
        <div class="relative bg-zinc-950/60 border border-zinc-850 rounded-xl p-3">
          <div #chartContainer class="w-full h-48"></div>
        </div>

        <!-- Tabla resumen de Nodos -->
        @if (view() === 'region') {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            <!-- Este Servidor -->
            <div class="bg-zinc-950/80 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Nodo Local (Este servidor)</span>
                <span class="text-sm font-black text-white mt-0.5 block">
                  {{ result()!.local.ping !== null ? result()!.local.ping + ' ms' : '--' }}
                </span>
              </div>
              <app-badge-status [status]="labelFor(result()!.local.status)" />
            </div>

            <!-- Nodos Remotos -->
            @for (r of result()!.regions; track r.linkId; let idx = $index) {
              <div class="bg-zinc-950/80 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block truncate max-w-[140px]">{{ r.federatedInstanceLabel }}</span>
                  <span class="text-sm font-black text-white mt-0.5 block">
                    {{ r.ping !== null ? r.ping + ' ms' : '--' }}
                  </span>
                </div>
                <app-badge-status [status]="labelFor(r.status)" />
              </div>
            }
          </div>
        } @else {
          <div class="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <span class="text-zinc-400 font-medium">
              Estado unificado del servicio ({{ 1 + result()!.regions.length }} regiones)
            </span>
            <app-badge-status [status]="labelFor(result()!.combinedStatus)" />
          </div>
        }
      </div>
    }
  `,
})
export class FederatedComparisonComponent implements OnDestroy {
  readonly monitorId = input.required<string>();

  @ViewChild('chartContainer') chartContainer?: ElementRef<HTMLDivElement>;

  private readonly federation = inject(FederationService);
  readonly view = signal<'region' | 'combined'>('region');
  readonly result = signal<IFederatedComparisonResult | null>(null);
  readonly hasData = signal<boolean>(false);

  private chartInstance: echarts.ECharts | null = null;
  private historyTimestamps: string[] = [];
  private localHistory: (number | null)[] = [];
  private regionHistories: Map<string, (number | null)[]> = new Map();

  constructor() {
    effect(() => {
      const id = this.monitorId();
      if (!id) {
        this.result.set(null);
        this.hasData.set(false);
        return;
      }

      this.federation.getComparison(id).subscribe({
        next: (data) => {
          this.result.set(data);
          this.hasData.set(true);
          this.updateHistoryData(data);
          setTimeout(() => this.renderChart(), 50);
        },
        error: () => {
          this.result.set(null);
          this.hasData.set(false);
        },
      });
    });
  }

  private updateHistoryData(data: IFederatedComparisonResult): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (this.historyTimestamps.length > 20) {
      this.historyTimestamps.shift();
      this.localHistory.shift();
      for (const [k, v] of this.regionHistories.entries()) {
        v.shift();
      }
    }

    this.historyTimestamps.push(timeStr);
    this.localHistory.push(data.local.ping);

    for (const r of data.regions) {
      if (!this.regionHistories.has(r.federatedInstanceLabel)) {
        this.regionHistories.set(r.federatedInstanceLabel, new Array(this.historyTimestamps.length - 1).fill(null));
      }
      this.regionHistories.get(r.federatedInstanceLabel)!.push(r.ping);
    }
  }

  private renderChart(): void {
    if (!this.chartContainer?.nativeElement) return;

    if (!this.chartInstance) {
      this.chartInstance = echarts.init(this.chartContainer.nativeElement);
    }

    const data = this.result();
    if (!data) return;

    const colors = ['#f97316', '#06b6d4', '#a855f7', '#10b981', '#ec4899'];
    const seriesList: any[] = [];

    // Serie Nodo Local
    seriesList.push({
      name: 'Este servidor (Local)',
      type: 'line',
      smooth: true,
      data: this.localHistory.length > 0 ? this.localHistory : [data.local.ping],
      itemStyle: { color: colors[0] },
      lineStyle: { width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(249, 115, 22, 0.35)' },
          { offset: 1, color: 'rgba(249, 115, 22, 0.0)' },
        ]),
      },
    });

    // Series Nodos Remotos
    data.regions.forEach((r, idx) => {
      const color = colors[(idx + 1) % colors.length];
      const hist = this.regionHistories.get(r.federatedInstanceLabel) || [r.ping];
      seriesList.push({
        name: r.federatedInstanceLabel,
        type: 'line',
        smooth: true,
        data: hist,
        itemStyle: { color },
        lineStyle: { width: 2.5 },
      });
    });

    const labels = this.historyTimestamps.length > 0 ? this.historyTimestamps : [new Date().toLocaleTimeString()];

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#09090b',
        borderColor: '#27272a',
        textStyle: { color: '#ffffff', fontSize: 11 },
        formatter: (params: any) => {
          let res = `<div class="font-bold border-b border-zinc-800 pb-1 mb-1 text-zinc-400">${params[0]?.axisValue || ''}</div>`;
          params.forEach((item: any) => {
            const val = item.value !== null && item.value !== undefined ? `${item.value} ms` : 'Sin respuesta';
            res += `<div class="flex items-center justify-between gap-4 py-0.5 text-xs">
              <span style="color: ${item.color}">${item.seriesName}:</span>
              <span class="font-mono font-bold text-white">${val}</span>
            </div>`;
          });
          return res;
        },
      },
      legend: {
        top: 0,
        textStyle: { color: '#a1a1aa', fontSize: 10 },
      },
      grid: {
        top: 30,
        bottom: 25,
        left: 40,
        right: 20,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: { color: '#71717a', fontSize: 9 },
      },
      yAxis: {
        type: 'value',
        name: 'ms',
        nameTextStyle: { color: '#71717a', fontSize: 9 },
        axisLine: { lineStyle: { color: '#27272a' } },
        splitLine: { lineStyle: { color: '#18181b', type: 'dashed' } },
        axisLabel: { color: '#71717a', fontSize: 9 },
      },
      series: seriesList,
    };

    this.chartInstance.setOption(option);
    this.chartInstance.resize();
  }

  labelFor(status: number | null): MonitorStatusLabel {
    return statusLabel(status);
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  }
}
