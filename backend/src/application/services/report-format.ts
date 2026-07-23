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

/**
 * Formatea en hora LOCAL del servidor (no UTC): la programación del informe (`hour`/`dayOfWeek`
 * en `IReportDefinition`) ya se decide en hora local del servidor (ver `RunScheduledReportsUseCase`
 * — usa `now.getHours()`/`now.getDay()`, no `getUTCHours()`), así que el rango impreso en el PDF
 * y el correo debe coincidir con esa misma referencia; mostrar UTC aquí desalineaba el rango
 * mostrado con la hora que el admin realmente configuró y con el reloj de quien lee el informe.
 */
export function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date): string => {
    const pad = (n: number): string => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  return `${fmt(from)} — ${fmt(to)}`;
}
