// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DeleteFederatedInstanceUseCase } from "./delete-federated-instance.usecase";
import { DeleteMonitorUseCase } from "../monitors/delete-monitor.usecase";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IMonitor } from "../../../domain/entities/monitor";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeInstance(): IFederatedInstance {
  return {
    id: "60f719b8f1d2c34567890abc",
    label: "China-VPS1",
    remoteUrl: "https://china.azkin.internal",
    remoteSecretEncrypted: "enc_secret",
    status: "revoked",
    createdById: "60f719b8f1d2c34567890def",
    createdAt: new Date(),
    revokedAt: new Date(),
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
  };
}

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "monitor-1",
    userId: "user-1",
    name: "google",
    type: "http",
    target: "https://google.com",
    interval: 60,
    retries: 2,
    retryInterval: 30,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    importedFromFederatedInstanceId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

test("DeleteFederatedInstanceUseCase elimina la instancia, sus vínculos y los monitores auto-importados (pero no los manuales)", async () => {
  const instance = makeInstance();
  const importedMonitor = makeMonitor({ id: "imported-1", name: "anime", importedFromFederatedInstanceId: instance.id });
  const manualMonitor = makeMonitor({ id: "manual-1", name: "google", importedFromFederatedInstanceId: null });
  const otherFederationMonitor = makeMonitor({ id: "imported-2", name: "otro", importedFromFederatedInstanceId: "otra-instancia" });

  let deletedLinksForInstance = "";
  let deletedInstanceId = "";
  const deletedMonitorIds: string[] = [];
  const notifyRevocationCalls: string[] = [];

  const fakeInstancesRepo = {
    findById: async (id: string) => (id === instance.id ? instance : null),
    delete: async (id: string) => {
      deletedInstanceId = id;
      return true;
    },
  } as any;

  const fakeLinksRepo = {
    deleteByFederatedInstanceId: async (id: string) => {
      deletedLinksForInstance = id;
      return 2;
    },
    findByLocalMonitorId: async () => [],
    delete: async () => true,
  } as any;

  const fakeMonitorsRepo = {
    findAll: async () => [importedMonitor, manualMonitor, otherFederationMonitor],
    findById: async (id: string) => [importedMonitor, manualMonitor, otherFederationMonitor].find((m) => m.id === id) ?? null,
    delete: async () => true,
  } as any;

  const fakeHeartbeats = { deleteByMonitor: async () => undefined } as any;
  const fakeScheduler = { unschedule: () => undefined } as any;
  const fakeAudit = { record: async () => {} } as any;

  const deleteMonitor = new DeleteMonitorUseCase(fakeMonitorsRepo, fakeHeartbeats, fakeScheduler, {
    record: async () => {
      // no-op, solo interesa el efecto en fakeMonitorsRepo.delete
    },
  } as any);
  // Interceptar delete() del repo de monitores para registrar cuáles se borraron realmente
  fakeMonitorsRepo.delete = async (id: string) => {
    deletedMonitorIds.push(id);
    return true;
  };

  const fakeClient = {
    notifyRevocation: async (peer: { remoteUrl: string }) => {
      notifyRevocationCalls.push(peer.remoteUrl);
    },
  } as any;

  const useCase = new DeleteFederatedInstanceUseCase(
    fakeInstancesRepo,
    fakeLinksRepo,
    fakeMonitorsRepo,
    deleteMonitor,
    fakeAudit,
    fakeClient,
    (enc: string) => enc,
    "identity-key",
  );
  await useCase.execute("user-1", instance.id);

  assert.deepEqual(deletedMonitorIds, ["imported-1"], "solo debe borrar el monitor auto-importado de ESTA instancia");
  assert.equal(deletedLinksForInstance, instance.id);
  assert.equal(deletedInstanceId, instance.id);
  assert.equal(notifyRevocationCalls.length, 1, "debe avisar al par remoto que la federación terminó");
  assert.equal(notifyRevocationCalls[0], instance.remoteUrl);
});

test("DeleteFederatedInstanceUseCase limpia vinculos huerfanos en OTRAS federaciones cuando el monitor borrado tambien pertenecia a un grupo con 3+ nodos", async () => {
  const instance = makeInstance();
  // Monitor importado desde ESTA instancia (nodo 1), pero que ademas quedo vinculado a un tercer
  // nodo (nodo 3) como parte del mismo grupo de monitoreo equivalente.
  const importedMonitor = makeMonitor({ id: "imported-1", name: "sitio-global", importedFromFederatedInstanceId: instance.id });

  const deletedLinkIds: string[] = [];

  const fakeInstancesRepo = {
    findById: async (id: string) => (id === instance.id ? instance : null),
    delete: async () => true,
  } as any;

  const fakeLinksRepo = {
    deleteByFederatedInstanceId: async () => 1,
    findByLocalMonitorId: async (monitorId: string) =>
      monitorId === "imported-1" ? [{ id: "link-to-node3", localMonitorId: "imported-1", federatedInstanceId: "instance-node3" }] : [],
    delete: async (id: string) => {
      deletedLinkIds.push(id);
      return true;
    },
  } as any;

  const fakeMonitorsRepo = {
    findAll: async () => [importedMonitor],
    findById: async (id: string) => (id === importedMonitor.id ? importedMonitor : null),
    delete: async () => true,
  } as any;

  const fakeHeartbeats = { deleteByMonitor: async () => undefined } as any;
  const fakeScheduler = { unschedule: () => undefined } as any;
  const deleteMonitor = new DeleteMonitorUseCase(fakeMonitorsRepo, fakeHeartbeats, fakeScheduler, {
    record: async () => {},
  } as any);

  const useCase = new DeleteFederatedInstanceUseCase(
    fakeInstancesRepo,
    fakeLinksRepo,
    fakeMonitorsRepo,
    deleteMonitor,
    { record: async () => {} } as any,
  );

  await useCase.execute("user-1", instance.id);

  assert.deepEqual(deletedLinkIds, ["link-to-node3"], "el vinculo huerfano hacia el nodo 3 debe limpiarse antes de borrar el monitor");
});

test("DeleteFederatedInstanceUseCase lanza NotFoundError si no existe", async () => {
  const fakeInstancesRepo = { findById: async () => null } as any;
  const fakeLinksRepo = { deleteByFederatedInstanceId: async () => 0 } as any;
  const fakeMonitorsRepo = { findAll: async () => [] } as any;
  const deleteMonitor = {} as DeleteMonitorUseCase;

  const useCase = new DeleteFederatedInstanceUseCase(
    fakeInstancesRepo,
    fakeLinksRepo,
    fakeMonitorsRepo,
    deleteMonitor,
    { record: async () => {} } as any,
  );
  await assert.rejects(
    () => useCase.execute("user-1", "nonexistent"),
    (err: any) => err instanceof NotFoundError,
  );
});
