// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetIds?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Pestaña "Auditoría": historial de acciones administrativas sensibles.
 * Se carga sola al instanciarse — como solo existe mientras la pestaña está activa
 * (`@if (activeTab() === 'audit')` en el orquestador), esto preserva el comportamiento de
 * carga perezosa que tenía settings.ts antes de la extracción.
 */
@Component({
  selector: 'app-audit-log-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
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
                @if (changesOf(e); as changes) {
                  @if (changes.length > 0) {
                    <div class="border-t border-zinc-900 pt-1.5 space-y-0.5">
                      @for (c of changes; track c[0]) {
                        <p class="text-zinc-500 font-mono text-[10px]">
                          <span class="text-zinc-400">{{ c[0] }}</span>: {{ formatValue(c[1].from) }} → <span class="text-zinc-300">{{ formatValue(c[1].to) }}</span>
                        </p>
                      }
                    </div>
                  }
                }
                @if (otherMetadataOf(e); as extra) {
                  @if (extra.length > 0) {
                    <p class="text-zinc-600 text-[10px]">
                      @for (m of extra; track m[0]; let last = $last) {
                        <span>{{ m[0] }}: {{ formatValue(m[1]) }}</span>@if (!last) { <span> · </span> }
                      }
                    </p>
                  }
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class AuditLogPanelComponent {
  private readonly http = inject(HttpClient);

  readonly auditLogEntries = signal<AuditLogEntry[]>([]);

  constructor() {
    this.loadAuditLog();
  }

  loadAuditLog(): void {
    this.http.get<AuditLogEntry[]>('/api/v1/audit-log').subscribe({
      next: (data) => this.auditLogEntries.set(data),
      error: () => {}
    });
  }

  /** Extrae `metadata.changes` (campo -> {from, to}) como pares para renderizar "qué se modificó". */
  changesOf(entry: AuditLogEntry): [string, { from: unknown; to: unknown }][] {
    const changes = entry.metadata?.['changes'];
    if (!changes || typeof changes !== 'object') return [];
    return Object.entries(changes as Record<string, { from: unknown; to: unknown }>);
  }

  /** Resto de metadata (razón, conteos, etc.), excluyendo 'changes' que ya tiene su propio bloque. */
  otherMetadataOf(entry: AuditLogEntry): [string, unknown][] {
    if (!entry.metadata) return [];
    return Object.entries(entry.metadata).filter(([key, value]) => key !== 'changes' && value !== undefined);
  }

  formatValue(value: unknown): string {
    if (value === undefined || value === null || value === '') return '—';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  }
}
