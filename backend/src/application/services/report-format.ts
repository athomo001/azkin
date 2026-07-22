// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Helpers de formato compartidos por el PDF (pdfmake-report-renderer.ts) y el cuerpo HTML del
 * correo (send-report-email.usecase.ts) — evita duplicar el mismo formateo en dos lugares.
 */

export function formatDurationSeconds(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

export function formatUptimePercent(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`;
}

export function formatSignedInteger(value: number): string {
  const rounded = Math.round(value);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function formatSignedDurationSeconds(deltaSeconds: number): string {
  const formatted = formatDurationSeconds(Math.abs(deltaSeconds));
  return deltaSeconds > 0 ? `+${formatted}` : deltaSeconds < 0 ? `-${formatted}` : formatted;
}

export function formatSignedPercentPoints(deltaRatio: number): string {
  const points = deltaRatio * 100;
  const rounded = points.toFixed(2);
  return points > 0 ? `+${rounded} pp` : `${rounded} pp`;
}

export function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date): string => d.toISOString().slice(0, 16).replace("T", " ");
  return `${fmt(from)} — ${fmt(to)} (UTC)`;
}
