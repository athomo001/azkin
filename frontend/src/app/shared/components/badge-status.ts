// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type MonitorStatus = 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE' | 'DEGRADED';

@Component({
  selector: 'app-badge-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass()" class="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-black tracking-wide uppercase border leading-none">
      <!-- Anillo de pulso animado únicamente para estado crítico DOWN -->
      @if (status() === 'DOWN') {
        <span class="absolute -inset-0.5 rounded-full border-2 border-rose-500 animate-ping opacity-50"></span>
      }
      <span [class]="dotClass()" class="w-1.5 h-1.5 rounded-full flex-shrink-0"></span>
      {{ statusLabel() }}
    </span>
  `
})
export class BadgeStatusComponent {
  readonly status = input.required<MonitorStatus>();

  /** Etiqueta textual según el estado actual */
  readonly statusLabel = computed(() => {
    switch (this.status()) {
      case 'UP':          return 'OPERATIVO';
      case 'DOWN':        return 'CAÍDO';
      case 'PENDING':     return 'VERIFICANDO';
      case 'MAINTENANCE': return 'EN MANTENIMIENTO';
      case 'DEGRADED':    return 'DEGRADADO';
    }
  });

  /** Clase dinámica del contenedor de la píldora según el estado actual */
  readonly badgeClass = computed(() => {
    switch (this.status()) {
      case 'UP':          return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'DOWN':        return 'bg-rose-500 border-rose-600 text-black';
      case 'PENDING':     return 'bg-amber-400 border-amber-500 text-black';
      case 'MAINTENANCE': return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'DEGRADED':    return 'bg-orange-500 border-orange-600 text-black';
    }
  });

  /** Clase dinámica del punto indicador de color sólido */
  readonly dotClass = computed(() => {
    switch (this.status()) {
      case 'UP':          return 'bg-emerald-500';
      case 'DOWN':        return 'bg-black/70';
      case 'PENDING':     return 'bg-black/70';
      case 'MAINTENANCE': return 'bg-sky-400';
      case 'DEGRADED':    return 'bg-black/70';
    }
  });
}
