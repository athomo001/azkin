// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { BulkAssignNotificationUseCase } from "./bulk-assign-notification.usecase";
import { IMonitorRepository, UpdateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m1",
    userId: "admin-1",
    name: "Sitio",
    type: "http",
    target: "https://sitio.test",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMonitorsRepo(existing: Map<string, IMonitor>) {
  const updated: { id: string; data: UpdateMonitorData }[] = [];
  const repo: IMonitorRepository = {
    create: async () => makeMonitor(),
    findAll: async () => Array.from(existing.values()),
    findById: async (id) => existing.get(id) ?? null,
    update: async (id, data) => {
      updated.push({ id, data });
      const current = existing.get(id);
      if (!current) return null;
      const merged = { ...current, ...data } as IMonitor;
      existing.set(id, merged);
      return merged;
    },
    delete: async () => true,
    deleteMany: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
  return { repo, updated };
}

const scheduler: IScheduler = {
  start: async () => undefined,
  schedule: () => undefined,
  reschedule: () => undefined,
  unschedule: () => undefined,
  stopAll: () => undefined,
  receivePushHeartbeat: async () => undefined,
};

function makeAuditLog() {
  const records: any[] = [];
  const repo: IAuditLogRepository = {
    record: async (data) => {
      records.push(data);
      return { id: "log-1", ...data, createdAt: new Date() } as any;
    },
    listRecent: async () => [],
    listAll: async () => [],
  };
  return { repo, records };
}

test("BulkAssignNotificationUseCase agrega el canal a varios monitores sin duplicarlo si ya lo tenían", async () => {
  const existing = new Map([
    ["m1", makeMonitor({ id: "m1", notificationIds: [] })],
    ["m2", makeMonitor({ id: "m2", notificationIds: ["notif-x"] })],
  ]);
  const { repo, updated } = makeMonitorsRepo(existing);
  const { repo: auditLog, records } = makeAuditLog();
  const useCase = new BulkAssignNotificationUseCase(repo, scheduler, auditLog);

  const result = await useCase.execute({
    actorId: "admin-1",
    monitorIds: ["m1", "m2"],
    notificationId: "notif-x",
    action: "add",
  });

  assert.equal(result.updatedCount, 1);
  assert.deepEqual(updated.map((u) => u.id), ["m1"]);
  assert.deepEqual((existing.get("m1") as IMonitor).notificationIds, ["notif-x"]);
  assert.deepEqual((existing.get("m2") as IMonitor).notificationIds, ["notif-x"]);
  assert.equal(records[0].action, "MONITORS_BULK_ASSIGN_NOTIFICATION");
});

test("BulkAssignNotificationUseCase quita el canal de los monitores que lo tenían (action: remove)", async () => {
  const existing = new Map([
    ["m1", makeMonitor({ id: "m1", notificationIds: ["notif-x", "notif-y"] })],
    ["m2", makeMonitor({ id: "m2", notificationIds: ["notif-y"] })],
  ]);
  const { repo, updated } = makeMonitorsRepo(existing);
  const { repo: auditLog } = makeAuditLog();
  const useCase = new BulkAssignNotificationUseCase(repo, scheduler, auditLog);

  const result = await useCase.execute({
    actorId: "admin-1",
    monitorIds: ["m1", "m2"],
    notificationId: "notif-x",
    action: "remove",
  });

  assert.equal(result.updatedCount, 1);
  assert.deepEqual(updated.map((u) => u.id), ["m1"]);
  assert.deepEqual((existing.get("m1") as IMonitor).notificationIds, ["notif-y"]);
});

test("BulkAssignNotificationUseCase ignora ids de monitor inexistentes sin fallar", async () => {
  const existing = new Map([["m1", makeMonitor({ id: "m1" })]]);
  const { repo } = makeMonitorsRepo(existing);
  const { repo: auditLog } = makeAuditLog();
  const useCase = new BulkAssignNotificationUseCase(repo, scheduler, auditLog);

  const result = await useCase.execute({
    actorId: "admin-1",
    monitorIds: ["m1", "no-existe"],
    notificationId: "notif-x",
    action: "add",
  });

  assert.equal(result.updatedCount, 1);
});
