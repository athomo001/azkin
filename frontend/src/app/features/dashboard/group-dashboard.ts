import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import { MonitorService } from '../../core/services/monitor.service';
import { BadgeStatusComponent } from '../../shared/components/badge-status';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-group-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeStatusComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <!-- Navbar -->
      <nav class="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-3">
          <button routerLink="/dashboard" class="text-zinc-500 hover:text-emerald-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 class="text-xl font-black text-emerald-500 tracking-tight">Azkin</h1>
          <span class="text-zinc-600">/</span>
          <span class="text-zinc-300 font-semibold">{{ groupName() }}</span>
        </div>
      </nav>

      <main class="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
        <!-- Gráfico multilínea ECharts -->
        <section>
          <h2 class="text-xl font-bold mb-4">Latencia Histórica del Grupo</h2>
          <div class="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 shadow-xl">
            @if (isLoading()) {
              <div class="h-64 flex items-center justify-center text-zinc-500">Cargando datos...</div>
            } @else {
              <div #chartEl class="w-full h-64"></div>
            }
          </div>
        </section>

        <!-- Panel de caídas recientes -->
        <section>
          <h2 class="text-xl font-bold mb-4">Caídas Recientes</h2>
          <div class="space-y-3">
            @if (downMonitors().length === 0) {
              <div class="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 text-zinc-500 text-sm text-center">
                ✓ Sin caídas detectadas en el grupo
              </div>
            }
            @for (m of downMonitors(); track m.id) {
              <div class="bg-zinc-900/40 border border-rose-900/30 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p class="font-semibold text-zinc-200">{{ m.name }}</p>
                  <p class="text-sm text-zinc-500 mt-0.5">{{ m.target }}</p>
                </div>
                <app-badge-status [status]="m.status" />
              </div>
            }
          </div>
        </section>
      </main>
    </div>
  `
})
export class GroupDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chartEl') chartEl!: ElementRef<HTMLDivElement>;
  private chart: echarts.ECharts | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly monitorService = inject(MonitorService);
  private readonly router = inject(Router);

  readonly groupName = signal('');
  readonly isLoading = signal(true);

  // Computed — filtra los monitores del grupo en estado DOWN para mostrar el panel de caídas
  readonly downMonitors = () =>
    this.monitorService.monitors().filter(m =>
      m.group === this.groupName() && m.status === 'DOWN'
    );

  ngOnInit(): void {
    this.groupName.set(this.route.snapshot.params['groupName'] ?? '');
    this.loadGroupData();
  }

  private loadGroupData(): void {
    this.isLoading.set(true);
    this.monitorService.getGroupOverview(this.groupName()).subscribe({
      next: (data: any) => {
        this.isLoading.set(false);
        setTimeout(() => this.renderChart(data), 0);
      },
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * Inicializa el gráfico de series temporales multilínea usando Apache ECharts
   */
  private renderChart(data: any): void {
    if (!this.chartEl) return;

    // Colores curados por el spec: esmeralda para UP, carmesí para DOWN
    const palette = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];
    const series = (data?.monitors || []).map((m: any, idx: number) => ({
      name: m.name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: palette[idx % palette.length] },
      // Gradiente de área bajo la curva según el spec de UI/UX
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${palette[idx % palette.length]}33` },
          { offset: 1, color: 'transparent' }
        ])
      },
      data: (m.heartbeats || []).map((h: any) => [h.timestamp, h.latency ?? 0])
    }));

    this.chart = echarts.init(this.chartEl.nativeElement, 'dark', { renderer: 'canvas' });
    this.chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#18181b', borderColor: '#3f3f46', textStyle: { color: '#e4e4e7' } },
      legend: { textStyle: { color: '#a1a1aa' }, top: 0 },
      xAxis: { type: 'time', axisLine: { lineStyle: { color: '#3f3f46' } }, axisLabel: { color: '#71717a' } },
      yAxis: { type: 'value', name: 'Latencia (ms)', nameTextStyle: { color: '#71717a' }, axisLabel: { color: '#71717a' }, splitLine: { lineStyle: { color: '#27272a' } } },
      series
    });
  }

  ngOnDestroy(): void {
    this.chart?.dispose();
  }
}
