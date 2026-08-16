// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import fs from "fs";
import path from "path";
import {
  IThemeModesScanner,
  ThemeModeSummary,
} from "../../application/ports/services/theme-modes-scanner";

const CACHE_TTL_MS = 60_000;
const DEFAULT_EMOJI = "🎮";
// Paleta fija estilo Tailwind, indexada de forma determinista por hash del id del modo — mismo
// criterio que `getColorForId` en el frontend (dashboard.ts), aplicado acá para `accentColor`
// cuando el modo no trae `mode.json` o le falta ese campo.
const ACCENT_COLOR_PALETTE = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#eab308",
  "#a78bfa",
  "#14b8a6",
];

interface ModeJson {
  name?: string;
  emoji?: string;
  accentColor?: string;
}

/**
 * Descubre los Modos Temáticos leyendo `basePath` en caliente (D1 de spec/07-modos-tematicos.md):
 * cada subcarpeta directa con al menos un `.gif` es un modo. Cachea el resultado en memoria por
 * `CACHE_TTL_MS` para no golpear el filesystem en cada request — 60s de demora en ver un modo
 * nuevo es aceptable a cambio de no depender de `fs.watch` (D13).
 */
export class FsThemeModesScanner implements IThemeModesScanner {
  private cachedAt = 0;
  private cachedResult: ThemeModeSummary[] | null = null;

  constructor(private readonly basePath: string) {}

  async listModes(): Promise<ThemeModeSummary[]> {
    const now = Date.now();
    if (this.cachedResult && now - this.cachedAt < CACHE_TTL_MS) {
      return this.cachedResult;
    }

    const result = this.scan();
    this.cachedResult = result;
    this.cachedAt = now;
    return result;
  }

  private scan(): ThemeModeSummary[] {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(this.basePath, { withFileTypes: true });
    } catch (err) {
      console.warn(
        `[FsThemeModesScanner] No se pudo leer ${this.basePath}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }

    const modes: ThemeModeSummary[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

      const modeDir = path.join(this.basePath, entry.name);
      const files = this.listGifFiles(modeDir);
      if (files.length === 0) continue;

      const modeJson = this.readModeJson(modeDir, entry.name);
      modes.push({
        id: entry.name,
        name: modeJson.name ?? this.deriveNameFromId(entry.name),
        emoji: modeJson.emoji ?? DEFAULT_EMOJI,
        accentColor: modeJson.accentColor ?? this.deriveAccentColor(entry.name),
        files,
      });
    }

    return modes;
  }

  /**
   * Devuelve cada nombre de archivo con un query string `?v=<mtime>` (cache-busting). Sin esto,
   * `express.static` sirve estos gifs con `Cache-Control: immutable, max-age=365d` (§5.1) — si se
   * reemplaza el contenido de un gif ya visitado (ej. corrigiendo transparencia) sin que cambie la
   * URL, los navegadores que ya lo cachearon jamás vuelven a pedirlo. Al depender de `mtime`, un
   * archivo reemplazado obtiene automáticamente una URL nueva.
   */
  private listGifFiles(modeDir: string): string[] {
    let files: fs.Dirent[];
    try {
      files = fs.readdirSync(modeDir, { withFileTypes: true });
    } catch {
      return [];
    }
    return files
      .filter((f) => f.isFile() && f.name.toLowerCase().endsWith(".gif"))
      .map((f) => f.name)
      .sort()
      .map((name) => {
        let mtimeMs = 0;
        try {
          mtimeMs = Math.floor(fs.statSync(path.join(modeDir, name)).mtimeMs);
        } catch {
          // Si stat falla (carrera con un borrado concurrente), se sirve sin cache-busting en vez
          // de romper el escaneo completo del modo.
        }
        return `${name}?v=${mtimeMs}`;
      });
  }

  private readModeJson(modeDir: string, modeId: string): ModeJson {
    const modeJsonPath = path.join(modeDir, "mode.json");
    if (!fs.existsSync(modeJsonPath)) return {};
    try {
      const raw = fs.readFileSync(modeJsonPath, "utf-8");
      const parsed = JSON.parse(raw) as ModeJson;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      console.warn(
        `[FsThemeModesScanner] mode.json inválido para el modo '${modeId}', se usan valores por defecto: ${err instanceof Error ? err.message : String(err)}`,
      );
      return {};
    }
  }

  private deriveNameFromId(id: string): string {
    return id
      .split(/[-_]/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private deriveAccentColor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % ACCENT_COLOR_PALETTE.length;
    return ACCENT_COLOR_PALETTE[index];
  }
}
