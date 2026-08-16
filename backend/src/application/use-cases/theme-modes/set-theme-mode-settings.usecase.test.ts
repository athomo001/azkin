// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { SetThemeModeSettingsUseCase } from "./set-theme-mode-settings.usecase";
import {
  IThemeModeSettingsRepository,
  UpsertThemeModeSettingsData,
} from "../../ports/repositories/theme-mode-settings-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

function makeSettingsRepo() {
  const upserts: UpsertThemeModeSettingsData[] = [];
  const repo: IThemeModeSettingsRepository = {
    getActive: async () => null,
    upsert: async (data) => {
      upserts.push(data);
      return { id: "settings-1", ...data, updatedAt: new Date() };
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

test("SetThemeModeSettingsUseCase persiste los ids deshabilitados y registra auditoría", async () => {
  const { repo: settings, upserts } = makeSettingsRepo();
  const { repo: auditLog, recorded } = makeAuditLog();
  const useCase = new SetThemeModeSettingsUseCase(settings, auditLog);

  const result = await useCase.execute("admin-1", ["uma"]);

  assert.deepEqual(upserts[0].disabledModeIds, ["uma"]);
  assert.equal(upserts[0].updatedById, "admin-1");
  assert.equal(recorded[0].action, "THEME_MODE_SETTINGS_SET");
  assert.deepEqual(recorded[0].metadata, { disabledModeIds: ["uma"] });
  assert.deepEqual(result.disabledModeIds, ["uma"]);
});

test("SetThemeModeSettingsUseCase permite volver a habilitar todo con un arreglo vacío", async () => {
  const { repo: settings, upserts } = makeSettingsRepo();
  const { repo: auditLog } = makeAuditLog();
  const useCase = new SetThemeModeSettingsUseCase(settings, auditLog);

  await useCase.execute("admin-1", []);

  assert.deepEqual(upserts[0].disabledModeIds, []);
});
