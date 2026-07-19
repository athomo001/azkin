// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GetRecentEventsUseCase } from "./get-recent-events.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository, RecentEventRecord } from "../../ports/repositories/heartbeat-repository";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(id: string, group: string | null = null): IMonitor {
  return {
    id,
    userId: "admin-1",
    name: `Monitor ${id}`,
    type: "http",
    target: `https://${id}.test`,
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

function makeRepos(monitors: IMonitor[], events: RecentEventRecord[]) {
  const monitorsRepo: IMonitorRepository = {
    create: async () => monitors[0],
    findAll: async () => monitors,
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
    getSummaries: async () => ({}),
    findLastEventsForMonitors: async (monitorIds) => events.filter((e) => monitorIds.includes(e.monitorId)),
  };

  return { monitorsRepo, heartbeats };
}

test("GetRecentEventsUseCase filtra por permisos de viewer antes de consultar heartbeats", async () => {
  const monitors = [makeMonitor("m1", "generales"), makeMonitor("m2", "otros")];
  const events: RecentEventRecord[] = [
    { monitorId: "m1", timestamp: new Date("2026-01-01T00:00:00Z"), status: 1, ping: 42, msg: null },
    { monitorId: "m2", timestamp: new Date("2026-01-01T00:01:00Z"), status: 0, ping: null, msg: "Timeout" },
  ];
  const { monitorsRepo, heartbeats } = makeRepos(monitors, events);
  const useCase = new GetRecentEventsUseCase(monitorsRepo, heartbeats);

  const result = await useCase.execute("viewer-1", "viewer", "admin-1", [{ type: "group", value: "generales" }]);

  assert.equal(result.length, 1);
  assert.equal(result[0].monitorId, "m1");
  assert.equal(result[0].monitorName, "Monitor m1");
  assert.equal(result[0].status, "UP");
});

test("GetRecentEventsUseCase no filtra nada para un admin (acceso global)", async () => {
  const monitors = [makeMonitor("m1"), makeMonitor("m2")];
  const events: RecentEventRecord[] = [
    { monitorId: "m1", timestamp: new Date(), status: 1, ping: 10, msg: null },
    { monitorId: "m2", timestamp: new Date(), status: 0, ping: null, msg: "Down" },
  ];
  const { monitorsRepo, heartbeats } = makeRepos(monitors, events);
  const useCase = new GetRecentEventsUseCase(monitorsRepo, heartbeats);

  const result = await useCase.execute("admin-1", "admin", "admin-1", []);

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((r) => r.status).sort(), ["DOWN", "UP"]);
});

test("GetRecentEventsUseCase devuelve vacío sin consultar heartbeats si el viewer no tiene monitores autorizados", async () => {
  const monitors = [makeMonitor("m1")];
  let heartbeatsQueried = false;
  const { monitorsRepo, heartbeats } = makeRepos(monitors, []);
  const spiedHeartbeats: IHeartbeatRepository = {
    ...heartbeats,
    findLastEventsForMonitors: async (ids) => {
      heartbeatsQueried = true;
      return heartbeats.findLastEventsForMonitors(ids, 30);
    },
  };
  const useCase = new GetRecentEventsUseCase(monitorsRepo, spiedHeartbeats);

  const result = await useCase.execute("viewer-1", "viewer", "admin-1", []);

  assert.deepEqual(result, []);
  assert.equal(heartbeatsQueried, false);
});
