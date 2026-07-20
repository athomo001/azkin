// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GetGroupEventsUseCase } from "./get-group-events.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";
import { IHeartbeat } from "../../../domain/entities/heartbeat";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m1",
    userId: "admin-1",
    name: "Monitor",
    type: "http",
    target: "https://m.test",
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

function makeRepos(monitors: IMonitor[], beats: IHeartbeat[]) {
  const monitorsRepo: IMonitorRepository = {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => monitors,
    findById: async () => null,
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

test("GetGroupEventsUseCase junta eventos de todos los monitores del grupo, ordenados como los devuelve el repositorio", async () => {
  const monitors = [
    makeMonitor({ id: "m1", name: "FOSS", group: "generales" }),
    makeMonitor({ id: "m2", name: "NIC Chile", group: "generales" }),
    makeMonitor({ id: "m3", name: "Otro Grupo", group: "otros" }),
  ];
  const beats: IHeartbeat[] = [
    { monitorId: "m1", timestamp: new Date("2026-01-01T00:00:00Z"), status: 1, ping: 42, msg: null },
    { monitorId: "m2", timestamp: new Date("2026-01-01T00:01:00Z"), status: 0, ping: null, msg: "Timeout" },
    { monitorId: "m3", timestamp: new Date("2026-01-01T00:02:00Z"), status: 1, ping: 10, msg: null },
  ];
  const { monitorsRepo, heartbeats } = makeRepos(monitors, beats);
  const useCase = new GetGroupEventsUseCase(monitorsRepo, heartbeats);

  const result = await useCase.execute("admin-1", "admin", "admin-1", [], "generales", 30 * 60 * 1000);

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((r) => r.monitorName).sort(), ["FOSS", "NIC Chile"]);
});

test("GetGroupEventsUseCase lanza NotFoundError si el grupo no existe", async () => {
  const { monitorsRepo, heartbeats } = makeRepos([], []);
  const useCase = new GetGroupEventsUseCase(monitorsRepo, heartbeats);

  await assert.rejects(() => useCase.execute("admin-1", "admin", "admin-1", [], "no-existe", 1000), NotFoundError);
});

test("GetGroupEventsUseCase lanza NotFoundError si un viewer no tiene permiso sobre ningún monitor del grupo", async () => {
  const monitors = [makeMonitor({ id: "m1", group: "otros" })];
  const { monitorsRepo, heartbeats } = makeRepos(monitors, []);
  const useCase = new GetGroupEventsUseCase(monitorsRepo, heartbeats);

  await assert.rejects(
    () => useCase.execute("viewer-1", "viewer", "admin-1", [{ type: "group", value: "generales" }], "otros", 1000),
    NotFoundError,
  );
});
