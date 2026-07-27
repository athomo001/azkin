// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { UpdateMonitorUseCase } from "./update-monitor.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository, RecordAuditLogData } from "../../ports/repositories/audit-log-repository";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m-1",
    userId: "admin-1",
    name: "SNMP switch",
    type: "snmp",
    target: "10.0.0.1",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    snmpCommunity: "old-community",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const scheduler: IScheduler = {
  start: async () => undefined,
  schedule: () => undefined,
  reschedule: () => undefined,
  unschedule: () => undefined,
  stopAll: () => undefined,
  receivePushHeartbeat: async () => undefined,
};

function makeAuditLogSpy(): { auditLog: IAuditLogRepository; calls: RecordAuditLogData[] } {
  const calls: RecordAuditLogData[] = [];
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      calls.push(data);
      return { id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data } as never;
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { auditLog, calls };
}

test("UpdateMonitorUseCase (AZ-062) enmascara snmpCommunity en el diff del audit log", async () => {
  const before = makeMonitor();
  const after = makeMonitor({ snmpCommunity: "new-community" });
  const monitors: IMonitorRepository = {
    findById: async () => before,
    update: async () => after,
  } as unknown as IMonitorRepository;
  const { auditLog, calls } = makeAuditLogSpy();

  const useCase = new UpdateMonitorUseCase(monitors, scheduler, auditLog);
  await useCase.execute("actor-1", "m-1", { snmpCommunity: "new-community" });

  assert.equal(calls.length, 1);
  const changes = calls[0].metadata?.changes as Record<string, { from: unknown; to: unknown }>;
  assert.ok(changes.snmpCommunity, "el campo debe seguir apareciendo en el diff");
  assert.notEqual(changes.snmpCommunity.from, "old-community");
  assert.notEqual(changes.snmpCommunity.to, "new-community");
  assert.ok(String(changes.snmpCommunity.to).includes("••••"));
});

test("UpdateMonitorUseCase no enmascara campos no sensibles en el diff", async () => {
  const before = makeMonitor();
  const after = makeMonitor({ name: "Nuevo nombre" });
  const monitors: IMonitorRepository = {
    findById: async () => before,
    update: async () => after,
  } as unknown as IMonitorRepository;
  const { auditLog, calls } = makeAuditLogSpy();

  const useCase = new UpdateMonitorUseCase(monitors, scheduler, auditLog);
  await useCase.execute("actor-1", "m-1", { name: "Nuevo nombre" });

  const changes = calls[0].metadata?.changes as Record<string, { from: unknown; to: unknown }>;
  assert.equal(changes.name.from, "SNMP switch");
  assert.equal(changes.name.to, "Nuevo nombre");
});
