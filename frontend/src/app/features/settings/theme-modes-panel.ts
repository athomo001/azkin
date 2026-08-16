// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';
import { ThemeModeAdminSummary } from '../../core/services/theme-mode.service';

/**
 * Pestaña "Modos Temáticos": habilitar/deshabilitar globalmente los modos descubiertos en
 * `assets/huevo/` (ver spec/07-modos-tematicos.md §6.2/§6.3). Deshabilitar un modo lo saca del
 * menú de todos los usuarios sin tocar código ni redeployar — agregar uno nuevo es solo copiar una
 * carpeta de gifs al servidor.
 */
@Component({
  selector: 'app-theme-modes-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
        <div class="p-6 space-y-1">
          <h3 class="text-sm font-bold text-white tracking-tight">{{ lang.t('settings.themeModes.title') }}</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5">{{ lang.t('settings.themeModes.desc') }}</p>
        </div>

        @if (isLoading()) {
          <div class="px-6 pb-6 text-xs text-zinc-500">{{ lang.t('stats.checking') }}</div>
        } @else if (modes().length === 0) {
          <div class="px-6 pb-6 text-xs text-zinc-500">{{ lang.t('settings.themeModes.noModes') }}</div>
        } @else {
          <div class="divide-y divide-zinc-850">
            @for (mode of modes(); track mode.id) {
              <div class="px-6 py-4 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="text-xl leading-none">{{ mode.emoji }}</span>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-zinc-200 truncate">{{ mode.name }}</p>
                    <p class="text-[10px] text-zinc-500 font-mono truncate">{{ mode.id }} · {{ mode.files.length }} {{ lang.t('settings.themeModes.filesCount') }}</p>
                  </div>
                </div>
                <label class="flex items-center gap-2 cursor-pointer shrink-0">
                  <input type="checkbox" [checked]="mode.enabled" (change)="toggleEnabled(mode.id)"
                    class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0 w-4 h-4">
                  <span class="text-[10px] font-bold uppercase tracking-wider" [class]="mode.enabled ? 'text-emerald-400' : 'text-zinc-600'">
                    {{ mode.enabled ? 'ON' : 'OFF' }}
                  </span>
                </label>
              </div>
            }
          </div>
          <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
            <button (click)="save()" [disabled]="isSaving()"
              class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-xs font-bold transition-all shadow-md">
              {{ isSaving() ? lang.t('settings.themeModes.saving') : lang.t('settings.themeModes.save') }}
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class ThemeModesPanelComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  public readonly lang = inject(LanguageService);

  readonly modes = signal<ThemeModeAdminSummary[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  constructor() {
    this.loadModes();
  }

  loadModes(): void {
    this.isLoading.set(true);
    this.http.get<ThemeModeAdminSummary[]>('/api/v1/theme-modes/admin').subscribe({
      next: (modes) => {
        this.isLoading.set(false);
        this.modes.set(modes ?? []);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.show(extractApiErrorMessage(err, this.lang.t('settings.themeModes.saveError')));
      }
    });
  }

  toggleEnabled(id: string): void {
    this.modes.update((list) => list.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  }

  save(): void {
    const disabledModeIds = this.modes()
      .filter((m) => !m.enabled)
      .map((m) => m.id);

    this.isSaving.set(true);
    this.http.put<{ success: boolean }>('/api/v1/theme-modes/admin/settings', { disabledModeIds }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.show(this.lang.t('settings.themeModes.saved'));
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.show(extractApiErrorMessage(err, this.lang.t('settings.themeModes.saveError')));
      }
    });
  }
}
