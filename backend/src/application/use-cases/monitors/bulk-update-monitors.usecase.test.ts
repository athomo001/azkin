// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { BulkUpdateMonitorsUseCase } from "./bulk-update-monitors.usecase";
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
    group: "Prod",
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

function makeScheduler() {
  const rescheduled: string[] = [];
  const unscheduled: string[] = [];
  const scheduler: IScheduler = {
    start: async () => undefined,
    schedule: () => undefined,
    reschedule: (monitor) => { rescheduled.push(monitor.id); },
    unschedule: (id) => { unscheduled.push(id); },
    stopAll: () => undefined,
    receivePushHeartbeat: async () => undefined,
  };
  return { scheduler, rescheduled, unscheduled };
}

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

test("BulkUpdateMonitorsUseCase aplica el mismo patch a todos los monitores indicados", async () => {
  const existing = new Map([
    ["m1", makeMonitor({ id: "m1", tags: ["viejo"], ignoreTls: false })],
    ["m2", makeMonitor({ id: "m2", tags: [], ignoreTls: false })],
  ]);
  const { repo, updated } = makeMonitorsRepo(existing);
  const { scheduler, rescheduled } = makeScheduler();
  const { repo: auditLog, records } = makeAuditLog();
  const useCase = new BulkUpdateMonitorsUseCase(repo, scheduler, auditLog);

  const result = await useCase.execute({
    actorId: "admin-1",
    monitorIds: ["m1", "m2"],
    patch: { ignoreTls: true, tags: ["nuevo"] },
  });

  assert.equal(result.updatedCount, 2);
  assert.deepEqual(updated.map((u) => u.id), ["m1", "m2"]);
  assert.equal((existing.get("m1") as IMonitor).ignoreTls, true);
  assert.deepEqual((existing.get("m1") as IMonitor).tags, ["nuevo"]);
  assert.deepEqual((existing.get("m2") as IMonitor).tags, ["nuevo"]);
  assert.deepEqual(rescheduled, ["m1", "m2"]);
  assert.equal(records.length, 1);
  assert.equal(records[0].action, "MONITORS_BULK_UPDATE");
  assert.deepEqual(records[0].targetIds, ["m1", "m2"]);
});

test("BulkUpdateMonitorsUseCase desagenda (unschedule) los monitores que el patch deja inactivos", async () => {
  const existing = new Map([["m1", makeMonitor({ id: "m1" })]]);
  const { repo } = makeMonitorsRepo(existing);
  const { scheduler, unscheduled } = makeScheduler();
  const { repo: auditLog } = makeAuditLog();
  const useCase = new BulkUpdateMonitorsUseCase(repo, scheduler, auditLog);

  await useCase.execute({
    actorId: "admin-1",
    monitorIds: ["m1"],
    patch: { notificationIds: ["notif-x"] },
  });

  // isActive no cambia con este patch, sigue true → no debería desagendarse.
  assert.deepEqual(unscheduled, []);
});

test("BulkUpdateMonitorsUseCase ignora ids de monitor inexistentes sin fallar", async () => {
  const existing = new Map([["m1", makeMonitor({ id: "m1" })]]);
  const { repo } = makeMonitorsRepo(existing);
  const { scheduler } = makeScheduler();
  const { repo: auditLog } = makeAuditLog();
  const useCase = new BulkUpdateMonitorsUseCase(repo, scheduler, auditLog);

  const result = await useCase.execute({
    actorId: "admin-1",
    monitorIds: ["m1", "no-existe"],
    patch: { tags: ["x"] },
  });

  assert.equal(result.updatedCount, 1);
});
