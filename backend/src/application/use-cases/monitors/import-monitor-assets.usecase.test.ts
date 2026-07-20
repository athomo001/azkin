// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ImportMonitorAssetsUseCase } from "./import-monitor-assets.usecase";
import { IMonitorRepository, CreateMonitorData, UpdateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IMonitor } from "../../../domain/entities/monitor";
import { QuotaExceededError } from "../../../domain/errors/domain-error";

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

function makeMonitorsRepo(existing: IMonitor[]) {
  const created: CreateMonitorData[] = [];
  const updated: { id: string; data: UpdateMonitorData }[] = [];
  const repo: IMonitorRepository = {
    create: async (data) => {
      created.push(data);
      return makeMonitor({ id: `new-${created.length}`, name: data.name, target: data.target, notificationIds: data.notificationIds });
    },
    findAll: async () => existing,
    findById: async () => null,
    update: async (id, data) => {
      updated.push({ id, data });
      return makeMonitor({ id, name: data.name ?? "Existing", target: data.target ?? "https://existing.test" });
    },
    delete: async () => true,
    deleteMany: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
  return { repo, created, updated };
}

const scheduler: IScheduler = {
  start: async () => undefined,
  schedule: () => undefined,
  reschedule: () => undefined,
  unschedule: () => undefined,
  stopAll: () => undefined,
  receivePushHeartbeat: async () => undefined,
};

test("ImportMonitorAssetsUseCase crea monitores válidos e ignora notificationIds/pushToken/id/userId del origen", async () => {
  const { repo, created } = makeMonitorsRepo([]);
  const useCase = new ImportMonitorAssetsUseCase(repo, scheduler);

  const result = await useCase.execute({
    userId: "admin-nuevo",
    monitors: [
      {
        // Un exportador antiguo o un archivo editado a mano podría incluir estos campos —
        // deben ignorarse siempre, sin importar que vengan presentes.
        id: "id-de-otra-instancia",
        userId: "admin-de-otra-instancia",
        pushToken: "token-de-otra-instancia",
        notificationIds: ["notif-que-no-existe-aqui"],
        name: "Sitio importado",
        type: "http",
        target: "https://importado.test",
        interval: 60,
        retries: 0,
        retryInterval: 60,
        group: "General",
        tags: ["web"],
      },
    ],
  });

  assert.equal(result.createdCount, 1);
  assert.equal(result.updatedCount, 0);
  assert.equal(result.errors.length, 0);
  assert.equal(created[0].userId, "admin-nuevo");
  assert.deepEqual(created[0].notificationIds, []);
  assert.equal((created[0] as any).id, undefined);
});

test("ImportMonitorAssetsUseCase acumula errores por activo inválido sin abortar el resto del lote", async () => {
  const { repo, created } = makeMonitorsRepo([]);
  const useCase = new ImportMonitorAssetsUseCase(repo, scheduler);

  const result = await useCase.execute({
    userId: "admin-1",
    monitors: [
      { name: "Válido", type: "http", target: "https://valido.test", interval: 60 },
      { name: "Sin type", target: "https://falta-type.test", interval: 60 },
      { name: "Puerto sin numero", type: "port", target: "10.0.0.1", interval: 60 },
    ],
  });

  assert.equal(result.createdCount, 1);
  assert.equal(result.errors.length, 2);
  assert.equal(result.errors[0].index, 1);
  assert.equal(result.errors[0].name, "Sin type");
  assert.equal(result.errors[1].index, 2);
  assert.deepEqual(created.map((c) => c.name), ["Válido"]);
});

test("ImportMonitorAssetsUseCase actualiza un monitor existente (mismo name+target) en vez de duplicarlo", async () => {
  const existing = makeMonitor({ id: "m-existing", name: "Sitio", target: "https://sitio.test" });
  const { repo, updated } = makeMonitorsRepo([existing]);
  const useCase = new ImportMonitorAssetsUseCase(repo, scheduler);

  const result = await useCase.execute({
    userId: "admin-1",
    monitors: [{ name: "Sitio", type: "http", target: "https://sitio.test", interval: 30 }],
  });

  assert.equal(result.createdCount, 0);
  assert.equal(result.updatedCount, 1);
  assert.equal(updated[0].id, "m-existing");
  assert.equal(updated[0].data.interval, 30);
});

test("ImportMonitorAssetsUseCase rechaza la importación completa si excede la cuota de 50 monitores", async () => {
  const existing = Array.from({ length: 49 }, (_, i) => makeMonitor({ id: `m-${i}`, name: `M${i}`, target: `https://m${i}.test` }));
  const { repo } = makeMonitorsRepo(existing);
  const useCase = new ImportMonitorAssetsUseCase(repo, scheduler);

  await assert.rejects(
    () =>
      useCase.execute({
        userId: "admin-1",
        monitors: [
          { name: "Nuevo 1", type: "http", target: "https://n1.test", interval: 60 },
          { name: "Nuevo 2", type: "http", target: "https://n2.test", interval: 60 },
        ],
      }),
    QuotaExceededError,
  );
});
