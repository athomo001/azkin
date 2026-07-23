// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { CreateFederatedMonitorLinkUseCase } from "./create-federated-monitor-link.usecase";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { IMonitor } from "../../../domain/entities/monitor";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "China-VPS1",
    remoteUrl: "https://china.example.com",
    remoteFederationPort: 8444,
    peerCertFingerprint: "aa:bb",
    status: "enrolled",
    createdById: "admin-1",
    createdAt: new Date(),
    revokedAt: null,
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
    ...overrides,
  };
}

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "monitor-1",
    userId: "admin-1",
    name: "Sitio principal",
    type: "http",
    target: "https://example.com",
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
  } as IMonitor;
}

function makeLink(overrides: Partial<IFederatedMonitorLink> = {}): IFederatedMonitorLink {
  return {
    id: "link-1",
    localMonitorId: "monitor-1",
    federatedInstanceId: "instance-1",
    remoteMonitorId: "remote-monitor-1",
    remoteMonitorLabel: "Sitio principal (China)",
    createdById: "admin-1",
    createdAt: new Date(),
    lastSyncedAt: null,
    ...overrides,
  };
}

function makeFakes(opts: { monitor?: IMonitor | null; instance?: IFederatedInstance | null } = {}) {
  const created: unknown[] = [];
  const links: IFederatedMonitorLinkRepository = {
    create: async (data) => {
      created.push(data);
      return makeLink(data);
    },
    findAll: async () => [],
    findByLocalMonitorId: async () => [],
    findById: async () => null,
    findByFederatedInstanceId: async () => [],
    delete: async () => true,
    markSynced: async () => undefined,
  };
  const federatedInstances: IFederatedInstanceRepository = {
    create: async () => makeInstance(),
    findAll: async () => [],
    findById: async () => (opts.instance === undefined ? makeInstance() : opts.instance),
    countActive: async () => 0,
    revoke: async () => null,
    findEnrolledByFingerprint: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
  };
  const monitors: IMonitorRepository = {
    create: async () => makeMonitor(),
    findAll: async () => [],
    findById: async () => (opts.monitor === undefined ? makeMonitor() : opts.monitor),
    update: async () => makeMonitor(),
    delete: async () => true,
    deleteMany: async () => 0,
    deleteAll: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { links, federatedInstances, monitors, auditLog, created };
}

test("CreateFederatedMonitorLinkUseCase lanza NotFoundError si el monitor local no existe", async () => {
  const { links, federatedInstances, monitors, auditLog } = makeFakes({ monitor: null });
  const useCase = new CreateFederatedMonitorLinkUseCase(links, federatedInstances, monitors, auditLog);

  await assert.rejects(
    () =>
      useCase.execute({
        actorId: "admin-1",
        localMonitorId: "no-existe",
        federatedInstanceId: "instance-1",
        remoteMonitorId: "remote-monitor-1",
        remoteMonitorLabel: "Sitio principal (China)",
      }),
    NotFoundError,
  );
});

test("CreateFederatedMonitorLinkUseCase lanza ValidationError si la instancia esta revocada", async () => {
  const { links, federatedInstances, monitors, auditLog } = makeFakes({ instance: makeInstance({ status: "revoked" }) });
  const useCase = new CreateFederatedMonitorLinkUseCase(links, federatedInstances, monitors, auditLog);

  await assert.rejects(
    () =>
      useCase.execute({
        actorId: "admin-1",
        localMonitorId: "monitor-1",
        federatedInstanceId: "instance-1",
        remoteMonitorId: "remote-monitor-1",
        remoteMonitorLabel: "Sitio principal (China)",
      }),
    ValidationError,
  );
});

test("CreateFederatedMonitorLinkUseCase crea el vinculo y registra auditoria", async () => {
  const { links, federatedInstances, monitors, auditLog, created } = makeFakes();
  const useCase = new CreateFederatedMonitorLinkUseCase(links, federatedInstances, monitors, auditLog);

  const link = await useCase.execute({
    actorId: "admin-1",
    localMonitorId: "monitor-1",
    federatedInstanceId: "instance-1",
    remoteMonitorId: "remote-monitor-1",
    remoteMonitorLabel: "Sitio principal (China)",
  });

  assert.equal(link.localMonitorId, "monitor-1");
  assert.equal(created.length, 1);
});
