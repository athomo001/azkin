// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ListMonitorsUseCase } from "./list-monitors.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository, HeartbeatSummary } from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(id: string, ownerUserId: string, group: string | null): IMonitor {
  return {
    id,
    userId: ownerUserId,
    name: `Monitor ${id}`,
    type: "http",
    target: "https://example.test",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group,
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

test("ListMonitorsUseCase: un admin ve el pool global aunque los monitores los haya creado otro admin (regresión multi-admin)", async () => {
  // Todos los monitores fueron creados por "admin-1"; un segundo admin ("admin-2") los consulta.
  const allMonitors = [
    makeMonitor("m1", "admin-1", "generales"),
    makeMonitor("m2", "admin-1", "netics"),
  ];

  const monitors: IMonitorRepository = {
    create: async () => allMonitors[0],
    findAll: async () => allMonitors,
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    deleteMany: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
  const heartbeats: IHeartbeatRepository = {
    save: async () => undefined,
    findLast24h: async () => [],
    findHistory: async () => [],
    deleteByMonitor: async () => undefined,
    getSummaries: async () => ({} as Record<string, HeartbeatSummary>),
  };

  const useCase = new ListMonitorsUseCase(monitors, heartbeats);
  const result = await useCase.execute("admin-2", "admin", "admin-2", []);

  assert.deepEqual(result.map((m) => m.id).sort(), ["m1", "m2"]);
});
