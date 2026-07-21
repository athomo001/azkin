// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GetMonitoringEngineSettingsUseCase } from "./get-monitoring-engine-settings.usecase";
import { IMonitoringEngineSettingsRepository } from "../../ports/repositories/monitoring-engine-settings-repository";
import { IMonitoringEngineSettings } from "../../../domain/entities/monitoring-engine-settings";

const ENV_DEFAULTS = { degradedLatencyMs: 5000, acceleratedIntervalSeconds: 15 };

function makeSettingsRepo(active: IMonitoringEngineSettings | null): IMonitoringEngineSettingsRepository {
  return {
    getActive: async () => active,
    upsert: async () => { throw new Error("not implemented"); },
  };
}

test("GetMonitoringEngineSettingsUseCase devuelve null en ambos campos (y los defaults) si no hay override", async () => {
  const useCase = new GetMonitoringEngineSettingsUseCase(makeSettingsRepo(null), ENV_DEFAULTS);

  const result = await useCase.execute();

  assert.equal(result.degradedLatencyMs, null);
  assert.equal(result.acceleratedIntervalSeconds, null);
  assert.deepEqual(result.defaults, ENV_DEFAULTS);
});

test("GetMonitoringEngineSettingsUseCase devuelve el override vigente junto con los defaults", async () => {
  const useCase = new GetMonitoringEngineSettingsUseCase(
    makeSettingsRepo({
      id: "s1",
      degradedLatencyMs: 8000,
      acceleratedIntervalSeconds: null,
      updatedAt: new Date(),
      updatedById: "admin-1",
    }),
    ENV_DEFAULTS,
  );

  const result = await useCase.execute();

  assert.equal(result.degradedLatencyMs, 8000);
  assert.equal(result.acceleratedIntervalSeconds, null, "el campo sin override sigue en null");
  assert.deepEqual(result.defaults, ENV_DEFAULTS);
});
