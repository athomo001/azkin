// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { BulkImportMonitorsFromCsvUseCase } from "./bulk-import-monitors-from-csv.usecase";
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m-existing",
    userId: "admin-1",
    name: "Existing",
    type: "http",
    target: "https://existing.test",
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

function makeMonitorsRepo(existing: IMonitor[]): IMonitorRepository & { created: CreateMonitorData[] } {
  const created: CreateMonitorData[] = [];
  return {
    created,
    create: async (data) => {
      created.push(data);
      return makeMonitor({ id: `new-${created.length}`, name: data.name, target: data.target });
    },
    findAll: async () => existing,
    findById: async () => null,
    update: async (id, data) => makeMonitor({ id, name: data.name ?? "Existing", target: data.target ?? "https://existing.test" }),
    delete: async () => true,
    deleteMany: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
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

test("BulkImportMonitorsFromCsvUseCase importa filas válidas y acumula errores de filas inválidas sin abortar el lote", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler);

  const csv = [
    "name,type,target,port,interval,retries,retryInterval,group,tags",
    "Sitio A,http,https://a.test,,60,0,60,General,web;prod",
    "Sitio Malo,port,https://b.test,,60,0,60,General,", // falta 'port', requerido para type=port
    "Sitio C,http,https://c.test,,60,0,60,General,web",
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.createdCount, 2);
  assert.equal(result.updatedCount, 0);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].row, 3);
  assert.deepEqual(monitors.created.map((m) => m.name).sort(), ["Sitio A", "Sitio C"]);
  assert.deepEqual(monitors.created.find((m) => m.name === "Sitio A")?.tags, ["web", "prod"]);
});
