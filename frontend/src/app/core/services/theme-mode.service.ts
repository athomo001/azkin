// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

/** Resumen de un modo temático habilitado, tal como lo expone `GET /api/v1/theme-modes`. */
export interface ThemeModeSummary {
  id: string;
  name: string;
  emoji: string;
  accentColor: string;
  /** URLs relativas ya resueltas por el backend, ej. `/theme-assets/sonic/sonic-Run.gif`. */
  files: string[];
}

/** Resumen de modo temático para la pantalla de administración (incluye deshabilitados). */
export interface ThemeModeAdminSummary extends ThemeModeSummary {
  enabled: boolean;
}

/**
 * Hash determinista de un string a un entero de 32 bits sin signo. Misma técnica que
 * `getColorForId` (ex `dashboard.ts`), reutilizada acá como semilla de PRNG.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** PRNG determinista (mulberry32) seedeado por un entero — mismo resultado para la misma semilla. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Permutación pseudo-aleatoria pero determinista (Fisher-Yates seedeado) de `arr`. */
function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const result = arr.slice();
  const rand = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Límite de series con gif simultáneo por gráfico de grupo (D7, spec §3.1/§8). */
const MAX_GIFTED_SERIES = 8;

const STORAGE_KEY = 'azkin-theme-mode';
/** Clave legada del booleano NyanCat — solo se lee acá, una vez, para migrar. */
const LEGACY_NYANCAT_KEY = 'azkin-nyancat';

/**
 * Estado y lógica de "Modos Temáticos" (ex easter egg NyanCat, ver spec/07-modos-tematicos.md).
 * Reemplaza el booleano `isNyanCatMode` que antes vivía repartido entre `dashboard.ts` y
 * `dashboard-navbar.ts` — ahora el estado (y el algoritmo de sorteo de gifs de la Sección 8 del
 * spec) vive completo acá, inyectable tanto desde el navbar como desde el shell de gráficos.
 */
@Injectable({ providedIn: 'root' })
export class ThemeModeService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly availableModes = signal<ThemeModeSummary[]>([]);
  readonly activeModeId = signal<string | null>(this.getInitialActiveModeId());

  private modesLoaded = false;
  private readonly groupMemo = new Map<string, Map<string, string>>();
  private readonly singleMemo = new Map<string, string | null>();

  /**
   * Se incrementa cada vez que el usuario elige un modo desde el menú (`setActiveMode`), incluso
   * si vuelve a elegir el mismo modo que ya tenía activo antes. Entra en la semilla del sorteo
   * (`pickGifForSingle`/`pickGifsForGroup`) para que cada SELECCIÓN sortee un gif nuevo, mientras
   * el resultado se mantiene estable entre renders/ticks de WebSocket mientras el modo sigue
   * activo (sin este contador, la elección era 100% determinista por `monitorId`+`modeId` y volver
   * a elegir el mismo modo siempre repetía el mismo personaje).
   */
  private selectionEpoch = 0;

  /** Carga `GET /api/v1/theme-modes` una sola vez (llamar desde el shell del dashboard al iniciar). */
  loadModes(): void {
    if (this.modesLoaded) return;
    this.modesLoaded = true;
    this.http.get<ThemeModeSummary[]>('/api/v1/theme-modes').subscribe({
      next: (modes) => this.availableModes.set(modes ?? []),
      error: () => {
        // Permitir reintentar en una carga posterior (ej. al volver a entrar al dashboard).
        this.modesLoaded = false;
      },
    });
  }

  /**
   * Cambia el modo activo. El origen local prevalece: se aplica de inmediato al signal y a
   * localStorage, y se intenta persistir en el backend en segundo plano (mismo patrón que el
   * antiguo `toggleNyanCat()` en `dashboard.ts`).
   */
  setActiveMode(id: string | null): void {
    this.activeModeId.set(id);
    // Nueva selección => nuevo sorteo, aunque sea el mismo modo de antes (ver `selectionEpoch`).
    this.selectionEpoch++;

    if (typeof window !== 'undefined') {
      if (id === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, id);
      }
    }

    // Intentar guardar en backend, pero el origen local prevalece.
    this.http
      .put<{ success: boolean; preferences: { themeMode: string | null } }>('/api/v1/users/preferences', { themeMode: id })
      .subscribe({
        next: () => {
          const current = this.authService.currentUser();
          if (current) {
            this.authService.currentUser.set({
              ...current,
              preferences: { ...(current.preferences || {}), themeMode: id },
            });
          }
        },
        error: () => {},
      });
  }

  /**
   * Algoritmo de sorteo por gráfico de grupo (spec §8). Devuelve un `Map<monitorId, gifUrl>` con,
   * como máximo, `MAX_GIFTED_SERIES` entradas — solo para los monitores que ganan cupo de gif en
   * este render (Paso 0: `DOWN`/`DEGRADED` primero). Memoizado por `(groupKey, activeModeId,
   * selectionEpoch, conjunto ordenado de ids seleccionados)` para que la asignación no salte entre
   * ticks de WebSocket mientras el modo siga siendo el mismo — pero si el usuario vuelve a elegir
   * un modo (mismo u otro) desde el menú, `selectionEpoch` cambia y el sorteo se repite de cero.
   */
  pickGifsForGroup(groupKey: string, monitors: Array<{ id: string; status: string }>): Map<string, string> {
    const modeId = this.activeModeId();
    if (!modeId) return new Map();

    const mode = this.availableModes().find((m) => m.id === modeId);
    if (!mode || mode.files.length === 0) return new Map();

    const giftedIds = ThemeModeService.selectGiftedMonitorIds(monitors, MAX_GIFTED_SERIES);
    if (giftedIds.length === 0) return new Map();

    const memoKey = `${groupKey}::${modeId}::${this.selectionEpoch}::${[...giftedIds].sort().join(',')}`;
    const cached = this.groupMemo.get(memoKey);
    if (cached) return cached;

    const seed = hashString(`${groupKey}::${modeId}::${this.selectionEpoch}`);
    const result = ThemeModeService.assignFilesToIds(giftedIds, mode.files, seed);

    // Solo interesa la última combinación vigente por grupo/modo — evita crecimiento sin límite.
    this.groupMemo.clear();
    this.groupMemo.set(memoKey, result);
    return result;
  }

  /**
   * Variante para el gráfico de un único monitor (`updateChart`): elección estable mientras no
   * cambien `monitorId`/modo activo/`selectionEpoch` (sin el paso de selección por estado, siempre
   * hay a lo sumo una sola serie). Igual que en `pickGifsForGroup`, volver a elegir un modo desde
   * el menú cambia `selectionEpoch` y sortea un gif nuevo aunque sea el mismo modo de antes.
   */
  pickGifForSingle(monitorId: string): string | null {
    const modeId = this.activeModeId();
    if (!modeId) return null;

    const mode = this.availableModes().find((m) => m.id === modeId);
    if (!mode || mode.files.length === 0) return null;

    const memoKey = `${monitorId}::${modeId}::${this.selectionEpoch}`;
    if (this.singleMemo.has(memoKey)) {
      return this.singleMemo.get(memoKey) ?? null;
    }

    const seed = hashString(memoKey);
    const gif = seededShuffle(mode.files, seed)[0] ?? null;

    this.singleMemo.clear();
    this.singleMemo.set(memoKey, gif);
    return gif;
  }

  /**
   * Paso 0 del algoritmo (§8): de las series del grupo, cuáles entran en el cupo de rendimiento
   * `k`. Prioriza `DOWN`/`DEGRADED` (en el orden recibido), completa lo que sobre con el resto
   * (también en el orden recibido), y corta en `k`.
   */
  private static selectGiftedMonitorIds(monitors: Array<{ id: string; status: string }>, k: number): string[] {
    const downOrDegraded = monitors.filter((m) => m.status === 'DOWN' || m.status === 'DEGRADED').map((m) => m.id);
    const rest = monitors.filter((m) => m.status !== 'DOWN' && m.status !== 'DEGRADED').map((m) => m.id);
    return [...downOrDegraded, ...rest].slice(0, k);
  }

  /**
   * Paso 1 del algoritmo (§8): "bolsa barajada determinista". Asigna un archivo distinto a cada
   * id mientras `i < files.length`; al superar esa cantidad ("lap"), rebaraja con una semilla
   * derivada para que la segunda vuelta no repita el mismo orden.
   */
  private static assignFilesToIds(ids: string[], files: string[], seed: number): Map<string, string> {
    const map = new Map<string, string>();
    if (files.length === 0) return map;

    const shuffled = seededShuffle(files, seed);

    ids.forEach((id, i) => {
      const lap = Math.floor(i / shuffled.length);
      // lap === 0 usa la barajada base (garantiza cero repetidos mientras i < files.length);
      // laps siguientes rebarajan con una semilla derivada para no calcar el mismo orden.
      const effective = lap === 0 ? shuffled : seededShuffle(files, seed + lap);
      map.set(id, effective[i % effective.length]);
    });

    return map;
  }

  /**
   * Estado inicial del signal `activeModeId`: lee la clave nueva de localStorage; si no existe,
   * migra una sola vez desde la clave legada `azkin-nyancat` (booleano) si estaba en `'true'`.
   */
  private getInitialActiveModeId(): string | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === '' ? null : stored;
    }

    if (localStorage.getItem(LEGACY_NYANCAT_KEY) === 'true') {
      localStorage.setItem(STORAGE_KEY, 'nyancat');
      return 'nyancat';
    }

    return null;
  }
}
