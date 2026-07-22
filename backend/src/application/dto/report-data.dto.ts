// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { ReportFrequency } from "../../domain/entities/report-definition";

export interface ReportMonitorRow {
  monitorId: string;
  monitorName: string;
  group: string | null;
  incidents: number;
  downtimeSeconds: number;
  uptimeRatio: number;
}

export interface ReportKpi {
  current: number;
  previous: number;
  delta: number;
}

/**
 * DTO puro producido por `GenerateReportDataUseCase` (AZ-045) y consumido tanto por
 * `IReportPdfRenderer` como por el cuerpo HTML del correo — sin I/O, sin dependencias de
 * infraestructura.
 */
export interface IReportData {
  definitionName: string;
  frequency: ReportFrequency;
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  monitorRows: ReportMonitorRow[]; // detalle completo, orden alfabético
  topOffenders: ReportMonitorRow[]; // top N por downtime desc
  otherOffendersCount: number;
  otherOffendersDowntimeSeconds: number;
  zeroIncidentMonitors: ReportMonitorRow[];
  kpis: {
    uptimeRatio: ReportKpi;
    totalIncidents: ReportKpi;
    totalDowntimeSeconds: ReportKpi;
  };
  bestMonitor: ReportMonitorRow | null;
  worstMonitor: ReportMonitorRow | null;
}
