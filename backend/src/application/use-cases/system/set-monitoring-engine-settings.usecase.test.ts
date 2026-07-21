// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { SetMonitoringEngineSettingsUseCase } from "./set-monitoring-engine-settings.usecase";
import {
  IMonitoringEngineSettingsRepository,
  UpsertMonitoringEngineSettingsData,
} from "../../ports/repositories/monitoring-engine-settings-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

function makeSettingsRepo() {
  const upserts: UpsertMonitoringEngineSettingsData[] = [];
  const repo: IMonitoringEngineSettingsRepository = {
    getActive: async () => null,
    upsert: async (data) => {
      upserts.push(data);
      return { id: "s1", ...data, updatedAt: new Date() };
    },
  };
  return { repo, upserts };
}

function makeAuditLog() {
  const recorded: any[] = [];
  const repo: IAuditLogRepository = {
    record: async (data) => {
      recorded.push(data);
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { repo, recorded };
}

test("SetMonitoringEngineSettingsUseCase persiste el override y registra auditoría", async () => {
  const { repo: settings, upserts } = makeSettingsRepo();
  const { repo: auditLog, recorded } = makeAuditLog();
  const useCase = new SetMonitoringEngineSettingsUseCase(settings, auditLog);

  await useCase.execute("admin-1", { degradedLatencyMs: 8000, acceleratedIntervalSeconds: 20 });

  assert.equal(upserts[0].degradedLatencyMs, 8000);
  assert.equal(upserts[0].acceleratedIntervalSeconds, 20);
  assert.equal(upserts[0].updatedById, "admin-1");
  assert.equal(recorded[0].action, "MONITORING_ENGINE_SETTINGS_SET");
});

test("SetMonitoringEngineSettingsUseCase permite restablecer con null (usar el valor de .env)", async () => {
  const { repo: settings, upserts } = makeSettingsRepo();
  const { repo: auditLog } = makeAuditLog();
  const useCase = new SetMonitoringEngineSettingsUseCase(settings, auditLog);

  await useCase.execute("admin-1", { degradedLatencyMs: null, acceleratedIntervalSeconds: null });

  assert.equal(upserts[0].degradedLatencyMs, null);
  assert.equal(upserts[0].acceleratedIntervalSeconds, null);
});
