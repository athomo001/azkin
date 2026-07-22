// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { resolveReportScopeMonitors } from "../../services/report-scope-resolver";
import { IReportScope, ReportFrequency } from "../../../domain/entities/report-definition";
import { IReportData, ReportMonitorRow } from "../../dto/report-data.dto";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

// Margen de seguridad sobre el intervalo configurado de los monitores del reporte para decidir
// cuándo un hueco entre heartbeats es "el motor de monitoreo estuvo detenido" en vez de un
// intervalo normal — ver `computeAvailabilityStats`. 20x es generoso a propósito: nunca debe
// recortar un intervalo real de un monitor con su cadencia normal de chequeo, solo huecos
// anómalos (reinicio del backend, host detenido, etc.).
const GAP_SAFETY_MULTIPLIER = 20;
const MIN_MAX_INTERVAL_SECONDS = 30 * 60;

export interface GenerateReportDataInput {
  definitionName: string;
  frequency: ReportFrequency;
  scope: IReportScope[];
  /** Fin exclusivo del periodo (normalmente "ahora" para descarga bajo demanda o envío). */
  to: Date;
  topN?: number;
}

function averageUptime(ratios: number[]): number {
  if (ratios.length === 0) return 1;
  return ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
}

/**
 * Genera el DTO de datos de un informe de disponibilidad (AZ-045): resuelve el alcance, agrega
 * métricas del periodo actual y del periodo anterior equivalente (para la comparación de
 * tendencia), y arma Top de indisponibilidad + servicios sin incidentes + KPIs. Sin I/O de
 * PDF/correo — reutilizable tanto por el envío programado como por la descarga bajo demanda.
 */
export class GenerateReportDataUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(input: GenerateReportDataInput): Promise<IReportData> {
    const periodMs = input.frequency === "daily" ? DAY_MS : WEEK_MS;
    const to = input.to;
    const from = new Date(to.getTime() - periodMs);
    const previousTo = from;
    const previousFrom = new Date(from.getTime() - periodMs);

    const allMonitors = await this.monitors.findAll();
    const scopedMonitors = resolveReportScopeMonitors(allMonitors, input.scope);
    const monitorIds = scopedMonitors.map((m) => m.id);

    // Deriva el tope de "duración de un heartbeat" del intervalo real configurado en los
    // monitores del reporte, en vez de un valor fijo ciego — un monitor con intervalo largo
    // legítimo no debe verse recortado, pero un hueco de horas por reinicio del backend sí.
    const configuredIntervalsSeconds = scopedMonitors.flatMap((m) => [m.interval, m.retryInterval]);
    const maxIntervalSeconds =
      configuredIntervalsSeconds.length > 0
        ? Math.max(MIN_MAX_INTERVAL_SECONDS, Math.max(...configuredIntervalsSeconds) * GAP_SAFETY_MULTIPLIER)
        : undefined;

    const [currentStats, previousStats] = await Promise.all([
      this.heartbeats.getAvailabilityReport(monitorIds, from, to, maxIntervalSeconds),
      this.heartbeats.getAvailabilityReport(monitorIds, previousFrom, previousTo, maxIntervalSeconds),
    ]);

    const monitorRows: ReportMonitorRow[] = scopedMonitors
      .map((m) => {
        const stats = currentStats[m.id] ?? { incidents: 0, downtimeSeconds: 0, uptimeRatio: 1 };
        return {
          monitorId: m.id,
          monitorName: m.name,
          group: m.group,
          incidents: stats.incidents,
          downtimeSeconds: stats.downtimeSeconds,
          uptimeRatio: stats.uptimeRatio,
        };
      })
      .sort((a, b) => a.monitorName.localeCompare(b.monitorName));

    const topN = input.topN ?? 10;
    const offendersSortedByDowntime = monitorRows
      .filter((row) => row.incidents > 0 || row.downtimeSeconds > 0)
      .sort((a, b) => b.downtimeSeconds - a.downtimeSeconds);
    const topOffenders = offendersSortedByDowntime.slice(0, topN);
    const otherOffenders = offendersSortedByDowntime.slice(topN);

    const zeroIncidentMonitors = monitorRows.filter((row) => row.incidents === 0);

    const totalCurrentIncidents = monitorRows.reduce((sum, row) => sum + row.incidents, 0);
    const totalCurrentDowntime = monitorRows.reduce((sum, row) => sum + row.downtimeSeconds, 0);
    const totalPreviousIncidents = monitorIds.reduce((sum, id) => sum + (previousStats[id]?.incidents ?? 0), 0);
    const totalPreviousDowntime = monitorIds.reduce((sum, id) => sum + (previousStats[id]?.downtimeSeconds ?? 0), 0);

    const globalUptimeCurrent = averageUptime(monitorRows.map((row) => row.uptimeRatio));
    const globalUptimePrevious = averageUptime(monitorIds.map((id) => previousStats[id]?.uptimeRatio ?? 1));

    const bestMonitor =
      monitorRows.length > 0
        ? [...monitorRows].sort((a, b) => b.uptimeRatio - a.uptimeRatio || a.downtimeSeconds - b.downtimeSeconds)[0]
        : null;
    const worstMonitor = offendersSortedByDowntime[0] ?? null;

    return {
      definitionName: input.definitionName,
      frequency: input.frequency,
      from,
      to,
      previousFrom,
      previousTo,
      monitorRows,
      topOffenders,
      otherOffendersCount: otherOffenders.length,
      otherOffendersDowntimeSeconds: otherOffenders.reduce((sum, row) => sum + row.downtimeSeconds, 0),
      zeroIncidentMonitors,
      kpis: {
        uptimeRatio: {
          current: globalUptimeCurrent,
          previous: globalUptimePrevious,
          delta: globalUptimeCurrent - globalUptimePrevious,
        },
        totalIncidents: {
          current: totalCurrentIncidents,
          previous: totalPreviousIncidents,
          delta: totalCurrentIncidents - totalPreviousIncidents,
        },
        totalDowntimeSeconds: {
          current: totalCurrentDowntime,
          previous: totalPreviousDowntime,
          delta: totalCurrentDowntime - totalPreviousDowntime,
        },
      },
      bestMonitor,
      worstMonitor,
    };
  }
}
