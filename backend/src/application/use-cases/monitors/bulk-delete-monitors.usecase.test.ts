// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { BulkDeleteMonitorsUseCase } from "./bulk-delete-monitors.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IHeartbeatRepository, HeartbeatSummary } from "../../ports/repositories/heartbeat-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(id: string): IMonitor {
  return {
    id,
    userId: "admin-1",
    name: `Monitor ${id}`,
    type: "http",
    target: "https://example.test",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

test("BulkDeleteMonitorsUseCase solo borra ids que pertenecen al usuario y registra auditoría", async () => {
  const owned = new Set(["m1", "m2"]);
  const unscheduled: string[] = [];
  let deleteManyCalledWith: string[] = [];
  let auditRecorded: any = null;

  const monitors: IMonitorRepository = {
    create: async () => makeMonitor("x"),
    findAll: async () => [],
    findById: async (id) => (owned.has(id) ? makeMonitor(id) : null),
    update: async () => null,
    delete: async () => true,
    deleteMany: async (ids) => {
      deleteManyCalledWith = ids;
      return ids.length;
    },
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

  const scheduler: IScheduler = {
    start: async () => undefined,
    schedule: () => undefined,
    reschedule: () => undefined,
    unschedule: (id: string) => {
      unscheduled.push(id);
    },
    stopAll: () => undefined,
    receivePushHeartbeat: async () => undefined,
  };

  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditRecorded = data;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
  };

  const useCase = new BulkDeleteMonitorsUseCase(monitors, heartbeats, scheduler, auditLog);
  const result = await useCase.execute("admin-1", ["m1", "m2", "not-owned"]);

  assert.deepEqual(result.deletedIds.sort(), ["m1", "m2"]);
  assert.equal(result.deletedCount, 2);
  assert.deepEqual(deleteManyCalledWith.sort(), ["m1", "m2"]);
  assert.deepEqual(unscheduled.sort(), ["m1", "m2"]);
  assert.equal(auditRecorded.action, "MONITORS_BULK_DELETE");
  assert.deepEqual(auditRecorded.targetIds.sort(), ["m1", "m2"]);
});
