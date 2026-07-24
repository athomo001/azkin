// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RegisterPeerMonitorLinkUseCase } from "./register-peer-monitor-link.usecase";
import { IFederatedMonitorLinkRepository, CreateFederatedMonitorLinkData } from "../../ports/repositories/federated-monitor-link-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { IMonitor } from "../../../domain/entities/monitor";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeCaller(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-2-from-node1-view",
    label: "Node 2",
    remoteUrl: "https://node2.example.com",
    remoteSecretEncrypted: "encrypted",
    status: "enrolled",
    createdById: "admin-on-node1",
    createdAt: new Date(),
    revokedAt: null,
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
    ...overrides,
  };
}

test("RegisterPeerMonitorLinkUseCase crea el vinculo reciproco con la etiqueta propia del par que llama, no la que este mande", async () => {
  const createdLinks: CreateFederatedMonitorLinkData[] = [];

  const links: IFederatedMonitorLinkRepository = {
    create: async (data) => {
      createdLinks.push(data);
      return { id: "link-1", ...data } as IFederatedMonitorLink;
    },
    findAll: async () => [],
    findByFederatedInstanceId: async () => [],
    findByLocalMonitorId: async () => [],
    findById: async () => null,
    markSynced: async () => undefined,
    delete: async () => true,
    deleteByFederatedInstanceId: async () => 0,
  };

  const monitors: IMonitorRepository = {
    findAll: async () => [],
    findById: async (id) => (id === "google-on-node1" ? ({ id } as IMonitor) : null),
    create: async () => ({}) as IMonitor,
    update: async () => null,
    delete: async () => true,
    bulkDelete: async () => 0,
  };

  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new RegisterPeerMonitorLinkUseCase(links, monitors, auditLog);
  const caller = makeCaller();

  const link = await useCase.execute(caller, {
    localMonitorId: "google-on-node1",
    remoteMonitorId: "google-on-node2",
    remoteMonitorName: "google",
  });

  assert.equal(link.id, "link-1");
  assert.equal(createdLinks[0].localMonitorId, "google-on-node1");
  assert.equal(createdLinks[0].federatedInstanceId, caller.id);
  assert.equal(createdLinks[0].remoteMonitorId, "google-on-node2");
  assert.equal(createdLinks[0].remoteMonitorLabel, "google (Node 2)");
  assert.equal(createdLinks[0].createdById, caller.createdById);
});

test("RegisterPeerMonitorLinkUseCase lanza NotFoundError si el monitor local no existe", async () => {
  const links: IFederatedMonitorLinkRepository = {
    create: async (data) => ({ id: "link-1", ...data } as IFederatedMonitorLink),
    findAll: async () => [],
    findByFederatedInstanceId: async () => [],
    findByLocalMonitorId: async () => [],
    findById: async () => null,
    markSynced: async () => undefined,
    delete: async () => true,
    deleteByFederatedInstanceId: async () => 0,
  };
  const monitors: IMonitorRepository = {
    findAll: async () => [],
    findById: async () => null,
    create: async () => ({}) as IMonitor,
    update: async () => null,
    delete: async () => true,
    bulkDelete: async () => 0,
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new RegisterPeerMonitorLinkUseCase(links, monitors, auditLog);
  await assert.rejects(
    () => useCase.execute(makeCaller(), { localMonitorId: "no-existe", remoteMonitorId: "x", remoteMonitorName: "x" }),
    (err: any) => err instanceof NotFoundError,
  );
});
