// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ResolveMonitoringEngineConfig } from "./resolve-monitoring-engine-config";
import { IMonitoringEngineSettingsRepository } from "../ports/repositories/monitoring-engine-settings-repository";
import { IMonitoringEngineSettings } from "../../domain/entities/monitoring-engine-settings";

const ENV_DEFAULTS = { degradedLatencyMs: 5000, acceleratedIntervalSeconds: 15 };

function makeSettingsRepo(active: IMonitoringEngineSettings | null, onGetActive?: () => void): IMonitoringEngineSettingsRepository {
  return {
    getActive: async () => {
      onGetActive?.();
      return active;
    },
    upsert: async () => { throw new Error("not implemented"); },
  };
}

test("ResolveMonitoringEngineConfig usa los valores de .env si no hay override guardado", async () => {
  const resolver = new ResolveMonitoringEngineConfig(makeSettingsRepo(null), ENV_DEFAULTS);

  const result = await resolver.resolve();

  assert.deepEqual(result, ENV_DEFAULTS);
});

test("ResolveMonitoringEngineConfig usa el override guardado por sobre el valor de .env", async () => {
  const resolver = new ResolveMonitoringEngineConfig(
    makeSettingsRepo({
      id: "s1",
      degradedLatencyMs: 8000,
      acceleratedIntervalSeconds: 20,
      updatedAt: new Date(),
      updatedById: "admin-1",
    }),
    ENV_DEFAULTS,
  );

  const result = await resolver.resolve();

  assert.equal(result.degradedLatencyMs, 8000);
  assert.equal(result.acceleratedIntervalSeconds, 20);
});

test("ResolveMonitoringEngineConfig combina un override parcial con el default del campo sin override", async () => {
  const resolver = new ResolveMonitoringEngineConfig(
    makeSettingsRepo({
      id: "s1",
      degradedLatencyMs: 8000,
      acceleratedIntervalSeconds: null,
      updatedAt: new Date(),
      updatedById: "admin-1",
    }),
    ENV_DEFAULTS,
  );

  const result = await resolver.resolve();

  assert.equal(result.degradedLatencyMs, 8000, "usa el override");
  assert.equal(result.acceleratedIntervalSeconds, ENV_DEFAULTS.acceleratedIntervalSeconds, "cae al default de .env");
});

test("ResolveMonitoringEngineConfig cachea el resultado: no consulta el repositorio en cada resolve()", async () => {
  let calls = 0;
  const resolver = new ResolveMonitoringEngineConfig(makeSettingsRepo(null, () => { calls++; }), ENV_DEFAULTS);

  await resolver.resolve();
  await resolver.resolve();
  await resolver.resolve();

  assert.equal(calls, 1, "solo la primera llamada debe consultar el repositorio, el resto usa la caché");
});
