// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FederationService, IFederatedComparisonResult } from '../../core/services/federation.service';
import { BadgeStatusComponent } from './badge-status';

type MonitorStatusLabel = 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE' | 'DEGRADED';

/** Mismo enum numérico que backend/src/domain/value-objects/monitor-status.ts. */
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
 * Comparación "Por región / Combinado" para un monitor con vínculos de federación (AZ-049).
 * Selector visual momentáneo (no persistido) — "Por región" es la vista por defecto; "Combinado"
 * siempre queda etiquetado como valor derivado, nunca como una medición directa (ver AZ-012).
 * No se renderiza nada si el monitor no tiene ningún vínculo.
 */
@Component({
  selector: 'app-federated-comparison',
  standalone: true,
  imports: [CommonModule, BadgeStatusComponent],
  template: `
    @if (result() && result()!.regions.length > 0) {
      <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Federación</h4>
          <div class="flex gap-1 bg-zinc-950/60 rounded-lg p-0.5 border border-zinc-850">
            <button (click)="view.set('region')"
              [class]="view() === 'region' ? 'bg-orange-600 text-white' : 'text-zinc-400'"
              class="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors">Por región</button>
            <button (click)="view.set('combined')"
              [class]="view() === 'combined' ? 'bg-orange-600 text-white' : 'text-zinc-400'"
              class="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors">Combinado</button>
          </div>
        </div>

        @if (view() === 'region') {
          <div class="space-y-2">
            <div class="flex items-center justify-between px-2 py-1">
              <span class="text-[11px] text-zinc-300 font-semibold">Este servidor</span>
              <div class="flex items-center gap-2">
                @if (result()!.local.ping !== null) { <span class="text-[10px] text-zinc-500 font-mono">{{ result()!.local.ping }}ms</span> }
                <app-badge-status [status]="labelFor(result()!.local.status)" />
              </div>
            </div>
            @for (r of result()!.regions; track r.linkId) {
              <div class="flex items-center justify-between px-2 py-1 border-t border-zinc-900">
                <span class="text-[11px] text-zinc-300 font-semibold">{{ r.federatedInstanceLabel }}</span>
                <div class="flex items-center gap-2">
                  @if (r.ping !== null) { <span class="text-[10px] text-zinc-500 font-mono">{{ r.ping }}ms</span> }
                  <app-badge-status [status]="labelFor(r.status)" />
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex items-center justify-between px-2 py-1">
            <span class="text-[10px] text-zinc-500">
              Valor derivado ({{ 1 + result()!.regions.length }} región{{ result()!.regions.length > 0 ? 'es' : '' }}) — no es una medición directa.
            </span>
            <app-badge-status [status]="labelFor(result()!.combinedStatus)" />
          </div>
        }
      </div>
    }
  `,
})
export class FederatedComparisonComponent implements OnInit {
  readonly monitorId = input.required<string>();

  private readonly federation = inject(FederationService);
  readonly view = signal<'region' | 'combined'>('region');
  readonly result = signal<IFederatedComparisonResult | null>(null);

  ngOnInit(): void {
    this.federation.getComparison(this.monitorId()).subscribe({
      next: (data) => this.result.set(data),
      error: () => this.result.set(null), // sin vínculos u otro error silencioso — no bloquea el detalle del monitor
    });
  }

  labelFor(status: number | null): MonitorStatusLabel {
    return statusLabel(status);
  }
}
