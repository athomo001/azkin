// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ExportMonitorAssetsUseCase } from "./export-monitor-assets.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m1",
    userId: "admin-1",
    name: "Sitio A",
    type: "http",
    target: "https://a.test",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: "General",
    tags: ["web"],
    isActive: true,
    notificationIds: ["notif-1", "notif-2"],
    pushToken: "secret-push-token",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    ...overrides,
  };
}

function makeMonitorsRepo(existing: IMonitor[]): IMonitorRepository {
  return {
    create: async () => makeMonitor(),
    findAll: async () => existing,
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    deleteMany: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
}

test("ExportMonitorAssetsUseCase descarta id/userId/createdAt/updatedAt/notificationIds/pushToken", async () => {
  const useCase = new ExportMonitorAssetsUseCase(makeMonitorsRepo([makeMonitor()]));

  const [asset] = await useCase.execute();

  assert.equal((asset as any).id, undefined);
  assert.equal((asset as any).userId, undefined);
  assert.equal((asset as any).createdAt, undefined);
  assert.equal((asset as any).updatedAt, undefined);
  assert.equal((asset as any).notificationIds, undefined);
  assert.equal((asset as any).pushToken, undefined);
  assert.equal(asset.name, "Sitio A");
  assert.equal(asset.target, "https://a.test");
  assert.deepEqual(asset.tags, ["web"]);
});

test("ExportMonitorAssetsUseCase devuelve un arreglo vacío si no hay monitores", async () => {
  const useCase = new ExportMonitorAssetsUseCase(makeMonitorsRepo([]));
  const result = await useCase.execute();
  assert.deepEqual(result, []);
});
