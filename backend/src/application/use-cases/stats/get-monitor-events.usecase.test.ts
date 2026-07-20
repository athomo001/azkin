// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GetMonitorEventsUseCase } from "./get-monitor-events.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m1",
    userId: "admin-1",
    name: "NIC Chile",
    type: "http",
    target: "https://nic.cl",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: "generales",
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepos(monitor: IMonitor | null, beats: IHeartbeat[]) {
  const monitorsRepo: IMonitorRepository = {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => (monitor ? [monitor] : []),
    findById: async (id) => (monitor && monitor.id === id ? monitor : null),
    update: async () => null,
    delete: async () => true,
    deleteMany: async () => 0,
    deleteAll: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };

  const heartbeats: IHeartbeatRepository = {
    save: async () => undefined,
    findLast24h: async () => [],
    findHistory: async () => [],
    findHistoryForMonitors: async (monitorIds) => beats.filter((b) => monitorIds.includes(b.monitorId)),
    deleteByMonitor: async () => undefined,
    getSummaries: async () => ({}),
    findLastEventsForMonitors: async () => [],
  };

  return { monitorsRepo, heartbeats };
}

test("GetMonitorEventsUseCase devuelve los eventos del monitor con status colapsado a UP/DOWN y su msg", async () => {
  const monitor = makeMonitor();
  const beats: IHeartbeat[] = [
    { monitorId: "m1", timestamp: new Date("2026-01-01T00:00:00Z"), status: 1, ping: 42, msg: null },
    { monitorId: "m1", timestamp: new Date("2026-01-01T00:01:00Z"), status: 0, ping: null, msg: "Timeout" },
  ];
  const { monitorsRepo, heartbeats } = makeRepos(monitor, beats);
  const useCase = new GetMonitorEventsUseCase(monitorsRepo, heartbeats);

  const result = await useCase.execute("admin-1", "admin", "admin-1", [], "m1", 30 * 60 * 1000);

  assert.equal(result.length, 2);
  assert.equal(result[0].status, "UP");
  assert.equal(result[0].monitorName, "NIC Chile");
  assert.equal(result[1].status, "DOWN");
  assert.equal(result[1].msg, "Timeout");
});

test("GetMonitorEventsUseCase lanza NotFoundError si el monitor no existe", async () => {
  const { monitorsRepo, heartbeats } = makeRepos(null, []);
  const useCase = new GetMonitorEventsUseCase(monitorsRepo, heartbeats);

  await assert.rejects(() => useCase.execute("admin-1", "admin", "admin-1", [], "no-existe", 1000), NotFoundError);
});

test("GetMonitorEventsUseCase lanza NotFoundError (no Forbidden) si un viewer no tiene permiso sobre el monitor", async () => {
  const monitor = makeMonitor({ group: "otros" });
  const { monitorsRepo, heartbeats } = makeRepos(monitor, []);
  const useCase = new GetMonitorEventsUseCase(monitorsRepo, heartbeats);

  await assert.rejects(
    () => useCase.execute("viewer-1", "viewer", "admin-1", [{ type: "group", value: "generales" }], "m1", 1000),
    NotFoundError,
  );
});
