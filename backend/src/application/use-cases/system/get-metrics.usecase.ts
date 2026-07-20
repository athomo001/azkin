// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";

/**
 * Caso de uso para generar el reporte de métricas en formato Prometheus (text exposition format).
 * Extraído de `composition-root.ts`: antes consultaba Mongoose directamente dentro del
 * wiring de dependencias, violando la regla de dependencia de Clean Architecture.
 */
export class GetMetricsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly heartbeats: IHeartbeatRepository,
  ) {}

  async execute(): Promise<string> {
    const monitorsList = await this.monitors.findAll();
    const ids = monitorsList.map((m) => m.id);
    const summaries = await this.heartbeats.getSummaries(ids);

    const total = monitorsList.length;
    const active = monitorsList.filter((m) => m.isActive);
    const up = active.filter((m) => summaries[m.id]?.lastStatus === MonitorStatus.UP).length;
    const down = active.filter((m) => summaries[m.id]?.lastStatus === MonitorStatus.DOWN).length;
    const pending = active.filter((m) => summaries[m.id]?.lastStatus === MonitorStatus.PENDING || !summaries[m.id]).length;
    const paused = monitorsList.filter((m) => !m.isActive).length;

    const lines: string[] = [];

    lines.push("# HELP azkin_monitors_total Total number of monitors");
    lines.push("# TYPE azkin_monitors_total gauge");
    lines.push(`azkin_monitors_total ${total}`, "");

    lines.push("# HELP azkin_monitors_active Total active monitors being checked");
    lines.push("# TYPE azkin_monitors_active gauge");
    lines.push(`azkin_monitors_active ${active.length}`, "");

    lines.push("# HELP azkin_monitors_up Active monitors in UP status");
    lines.push("# TYPE azkin_monitors_up gauge");
    lines.push(`azkin_monitors_up ${up}`, "");

    lines.push("# HELP azkin_monitors_down Active monitors in DOWN status");
    lines.push("# TYPE azkin_monitors_down gauge");
    lines.push(`azkin_monitors_down ${down}`, "");

    lines.push("# HELP azkin_monitors_pending Active monitors in PENDING status");
    lines.push("# TYPE azkin_monitors_pending gauge");
    lines.push(`azkin_monitors_pending ${pending}`, "");

    lines.push("# HELP azkin_monitors_paused Paused monitors");
    lines.push("# TYPE azkin_monitors_paused gauge");
    lines.push(`azkin_monitors_paused ${paused}`, "");

    lines.push("# HELP azkin_monitor_status Individual monitor status (1 = UP, 0 = DOWN/PENDING/PAUSED)");
    lines.push("# TYPE azkin_monitor_status gauge");
    for (const m of monitorsList) {
      const name = m.name.replace(/"/g, '\\"');
      const statusVal = m.isActive && summaries[m.id]?.lastStatus === MonitorStatus.UP ? 1 : 0;
      lines.push(`azkin_monitor_status{id="${m.id}",name="${name}",type="${m.type}",group="${m.group || ""}"} ${statusVal}`);
    }
    lines.push("");

    lines.push("# HELP azkin_monitor_latency_ms Individual monitor last ping latency in milliseconds");
    lines.push("# TYPE azkin_monitor_latency_ms gauge");
    for (const m of monitorsList) {
      const summary = summaries[m.id];
      if (m.isActive && summary && summary.lastPing !== null && summary.lastPing !== undefined) {
        const name = m.name.replace(/"/g, '\\"');
        lines.push(`azkin_monitor_latency_ms{id="${m.id}",name="${name}",type="${m.type}",group="${m.group || ""}"} ${summary.lastPing}`);
      }
    }

    return lines.join("\n") + "\n";
  }
}
