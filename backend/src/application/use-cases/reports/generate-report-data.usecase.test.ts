// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GenerateReportDataUseCase } from "./generate-report-data.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";
import { AvailabilityStats } from "../../services/availability-report-calculator";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m1",
    userId: "admin-1",
    name: "Sitio A",
    type: "http",
    target: "https://a.example.com",
    interval: 60,
    retries: 3,
    retryInterval: 30,
    group: "Comercial",
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as IMonitor;
}

function makeMonitorRepo(monitors: IMonitor[]): IMonitorRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => monitors,
    findById: async () => null,
    update: async () => null,
    delete: async () => false,
    deleteMany: async () => 0,
    deleteAll: async () => 0,
    findAllActive: async () => monitors,
    distinctTags: async () => [],
  };
}

function makeHeartbeatRepo(
  statsByRange: (monitorIds: string[], from: Date, to: Date) => Record<string, AvailabilityStats>,
): IHeartbeatRepository {
  return {
    save: async () => undefined,
    findLast24h: async () => [],
    findHistory: async () => [],
    findHistoryForMonitors: async () => [],
    deleteByMonitor: async () => undefined,
    getSummaries: async () => ({}),
    findLastEventsForMonitors: async () => [],
    getAvailabilityReport: async (monitorIds, from, to) => statsByRange(monitorIds, from, to),
  };
}

test("GenerateReportDataUseCase arma Top de indisponibilidad, zero-incident y KPIs con trend", async () => {
  const monitors = [
    makeMonitor({ id: "m1", name: "Sitio A", group: "Comercial" }),
    makeMonitor({ id: "m2", name: "Sitio B", group: "Comercial" }),
    makeMonitor({ id: "m3", name: "Sitio C", group: "Infra" }),
  ];

  const currentStats: Record<string, AvailabilityStats> = {
    m1: { incidents: 3, downtimeSeconds: 1200, uptimeRatio: 0.9 },
    m2: { incidents: 0, downtimeSeconds: 0, uptimeRatio: 1 },
    m3: { incidents: 1, downtimeSeconds: 300, uptimeRatio: 0.98 },
  };
  const previousStats: Record<string, AvailabilityStats> = {
    m1: { incidents: 1, downtimeSeconds: 400, uptimeRatio: 0.97 },
    m2: { incidents: 0, downtimeSeconds: 0, uptimeRatio: 1 },
    m3: { incidents: 0, downtimeSeconds: 0, uptimeRatio: 1 },
  };

  const to = new Date("2026-07-21T08:00:00Z");
  const heartbeats = makeHeartbeatRepo((_ids, from) => {
    // El rango del periodo anterior termina exactamente donde empieza el actual.
    return from.getTime() < to.getTime() - 24 * 60 * 60 * 1000 ? previousStats : currentStats;
  });

  const useCase = new GenerateReportDataUseCase(makeMonitorRepo(monitors), heartbeats);
  const data = await useCase.execute({
    definitionName: "Diario — Comercial",
    frequency: "daily",
    scope: [{ type: "all" }],
    to,
  });

  assert.equal(data.monitorRows.length, 3);
  assert.deepEqual(data.topOffenders.map((r) => r.monitorId), ["m1", "m3"]);
  assert.deepEqual(data.zeroIncidentMonitors.map((r) => r.monitorId), ["m2"]);
  assert.equal(data.worstMonitor?.monitorId, "m1");
  assert.equal(data.bestMonitor?.monitorId, "m2");
  assert.equal(data.kpis.totalIncidents.current, 4);
  assert.equal(data.kpis.totalIncidents.previous, 1);
  assert.equal(data.kpis.totalIncidents.delta, 3);
  assert.equal(data.kpis.totalDowntimeSeconds.current, 1500);
  assert.equal(data.kpis.totalDowntimeSeconds.previous, 400);
});

test("GenerateReportDataUseCase acota el reporte al scope de grupo, no al pool completo", async () => {
  const monitors = [
    makeMonitor({ id: "m1", name: "Sitio A", group: "Comercial" }),
    makeMonitor({ id: "m2", name: "Sitio B", group: "Infra" }),
  ];
  const heartbeats = makeHeartbeatRepo(() => ({}));

  const useCase = new GenerateReportDataUseCase(makeMonitorRepo(monitors), heartbeats);
  const data = await useCase.execute({
    definitionName: "Diario — Comercial",
    frequency: "daily",
    scope: [{ type: "group", value: "Comercial" }],
    to: new Date("2026-07-21T08:00:00Z"),
  });

  assert.deepEqual(data.monitorRows.map((r) => r.monitorId), ["m1"]);
});
