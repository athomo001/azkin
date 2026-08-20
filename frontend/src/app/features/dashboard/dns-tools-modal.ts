// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DnsToolsService, DnsToolRecordType } from '../../core/services/dns-tools.service';
import { LanguageService } from '../../core/services/language.service';

type DnsToolTab = 'lookup' | 'reverse';

/**
 * Modal de diagnóstico DNS accesible desde el navbar (ver dashboard-navbar.ts).
 * Deliberadamente separado del flujo de "Agregar Monitor": esto es una consulta puntual bajo
 * demanda, no persiste nada ni agenda checks — resolución directa (dominio → registro) y
 * reversa (IP → hostname), cada una contra el resolver del sistema o uno específico a elección.
 */
@Component({
  selector: 'app-dns-tools-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div (click)="close.emit()" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div class="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-fade-in">
        <div class="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-orange-500">{{ lang.t('dnsTool.title') }}</h3>
            <p class="text-xs text-zinc-500 mt-0.5">{{ lang.t('dnsTool.subtitle') }}</p>
          </div>
          <button (click)="close.emit()" aria-label="Cerrar" title="Cerrar" class="text-zinc-500 hover:text-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <div class="flex gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
            <button (click)="setTab('lookup')"
              class="flex-1 text-xs font-bold uppercase tracking-wider py-1.5 rounded-md transition-colors"
              [class]="tab() === 'lookup' ? 'bg-orange-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'">
              {{ lang.t('dnsTool.tabLookup') }}
            </button>
            <button (click)="setTab('reverse')"
              class="flex-1 text-xs font-bold uppercase tracking-wider py-1.5 rounded-md transition-colors"
              [class]="tab() === 'reverse' ? 'bg-orange-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'">
              {{ lang.t('dnsTool.tabReverse') }}
            </button>
          </div>

          @if (tab() === 'lookup') {
            <div class="space-y-3 animate-fade-in">
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('dnsTool.hostname') }}</label>
                <input type="text" [(ngModel)]="hostname" placeholder="Ej. www.google.com" required
                  (keydown.enter)="runLookup()"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('dnsTool.resolver') }}</label>
                  <input type="text" [(ngModel)]="resolver" placeholder="Ej. 8.8.8.8"
                    (keydown.enter)="runLookup()"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
                  <p class="text-[10px] text-zinc-600 mt-1">{{ lang.t('dnsTool.resolverHint') }}</p>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('dnsTool.recordType') }}</label>
                  <select [(ngModel)]="recordType"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white">
                    <option value="A">A (IPv4)</option>
                    <option value="AAAA">AAAA (IPv6)</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX</option>
                    <option value="TXT">TXT</option>
                  </select>
                </div>
              </div>
              <button (click)="runLookup()" [disabled]="loading() || !hostname().trim()"
                class="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black text-sm py-2 rounded-lg transition-colors">
                {{ loading() ? lang.t('dnsTool.querying') : lang.t('dnsTool.submit') }}
              </button>

              @if (lookupResult(); as result) {
                <div class="rounded-lg border p-3 text-xs animate-fade-in"
                  [class]="result.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'">
                  <p class="font-bold">{{ result.msg }}</p>
                  @if (result.ping !== null) {
                    <p class="text-zinc-500 mt-0.5">{{ result.ping }} ms</p>
                  }
                  @if (result.records.length > 0) {
                    <ul class="mt-2 space-y-1 font-mono text-[11px] text-zinc-300">
                      @for (record of result.records; track record) {
                        <li class="break-all">{{ record }}</li>
                      }
                    </ul>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="space-y-3 animate-fade-in">
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('dnsTool.ip') }}</label>
                <input type="text" [(ngModel)]="ip" placeholder="Ej. 8.8.8.8" required
                  (keydown.enter)="runReverse()"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ lang.t('dnsTool.resolver') }}</label>
                <input type="text" [(ngModel)]="resolver" placeholder="Ej. 8.8.8.8"
                  (keydown.enter)="runReverse()"
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-700">
                <p class="text-[10px] text-zinc-600 mt-1">{{ lang.t('dnsTool.resolverHint') }}</p>
              </div>
              <button (click)="runReverse()" [disabled]="loading() || !ip().trim()"
                class="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black text-sm py-2 rounded-lg transition-colors">
                {{ loading() ? lang.t('dnsTool.querying') : lang.t('dnsTool.submit') }}
              </button>

              @if (reverseResult(); as result) {
                <div class="rounded-lg border p-3 text-xs animate-fade-in"
                  [class]="result.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'">
                  <p class="font-bold">{{ result.msg }}</p>
                  @if (result.ping !== null) {
                    <p class="text-zinc-500 mt-0.5">{{ result.ping }} ms</p>
                  }
                  @if (result.hostnames.length > 0) {
                    <ul class="mt-2 space-y-1 font-mono text-[11px] text-zinc-300">
                      @for (host of result.hostnames; track host) {
                        <li class="break-all">{{ host }}</li>
                      }
                    </ul>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.15s ease-out; }
  `]
})
export class DnsToolsModalComponent {
  private readonly dnsTools = inject(DnsToolsService);
  readonly lang = inject(LanguageService);

  readonly close = output<void>();

  readonly tab = signal<DnsToolTab>('lookup');
  readonly loading = signal(false);

  readonly hostname = signal('');
  readonly resolver = signal('');
  readonly recordType = signal<DnsToolRecordType>('A');
  readonly ip = signal('');

  readonly lookupResult = signal<{ ok: boolean; records: string[]; ping: number | null; msg: string } | null>(null);
  readonly reverseResult = signal<{ ok: boolean; hostnames: string[]; ping: number | null; msg: string } | null>(null);

  setTab(tab: DnsToolTab): void {
    this.tab.set(tab);
  }

  runLookup(): void {
    const hostname = this.hostname().trim();
    if (!hostname || this.loading()) return;

    this.loading.set(true);
    this.dnsTools.lookup(hostname, this.resolver().trim() || undefined, this.recordType()).subscribe({
      next: (result) => {
        this.lookupResult.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.lookupResult.set({ ok: false, records: [], ping: null, msg: 'Error al conectar con el servidor' });
        this.loading.set(false);
      },
    });
  }

  runReverse(): void {
    const ip = this.ip().trim();
    if (!ip || this.loading()) return;

    this.loading.set(true);
    this.dnsTools.reverse(ip, this.resolver().trim() || undefined).subscribe({
      next: (result) => {
        this.reverseResult.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.reverseResult.set({ ok: false, hostnames: [], ping: null, msg: 'Error al conectar con el servidor' });
        this.loading.set(false);
      },
    });
  }
}
