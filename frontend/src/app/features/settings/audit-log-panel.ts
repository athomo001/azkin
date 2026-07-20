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
  createdAt: string;
}

/**
 * Pestaña "Auditoría" (AZ-030): historial de acciones administrativas sensibles.
 * Se carga sola al instanciarse — como solo existe mientras la pestaña está activa
 * (`@if (activeTab() === 'audit')` en el orquestador), esto preserva el comportamiento de
 * carga perezosa que tenía settings.ts antes de la extracción (AZ-016).
 */
@Component({
  selector: 'app-audit-log-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
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
}
