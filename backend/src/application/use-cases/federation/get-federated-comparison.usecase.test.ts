// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GetFederatedComparisonUseCase } from "./get-federated-comparison.usecase";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedHeartbeatRepository } from "../../ports/repositories/federated-heartbeat-repository";
import { HeartbeatSummary, IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { IMonitor } from "../../../domain/entities/monitor";
import { MonitorStatus } from "../../../domain/value-objects/monitor-status";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "China-VPS1",
    remoteUrl: "https://china.example.com",
    remoteSecretEncrypted: "encrypted-placeholder",
    status: "enrolled",
    createdById: "admin-1",
    createdAt: new Date(),
    revokedAt: null,
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
    ...overrides,
  };
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
    lastSyncedAt: new Date(),
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

function makeMonitorsRepo(monitor: IMonitor | null = makeMonitor()): IMonitorRepository {
  return {
    create: async () => makeMonitor(),
    findAll: async () => (monitor ? [monitor] : []),
    findById: async () => monitor,
    update: async () => makeMonitor(),
    delete: async () => true,
    deleteMany: async () => 0,
    deleteAll: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
}

function makeHeartbeatsRepo(summary: HeartbeatSummary): IHeartbeatRepository {
  return {
    save: async () => undefined,
    findLast24h: async () => [],
    findHistory: async () => [],
    findSince: async () => [],
    findHistoryForMonitors: async () => [],
    deleteByMonitor: async () => undefined,
    getSummaries: async () => ({ "monitor-1": summary }),
    findLastEventsForMonitors: async () => [],
    getAvailabilityReport: async () => ({}),
  };
}

test("GetFederatedComparisonUseCase combina el estado local (UP) con una region caida (DOWN) -> combinado DOWN", async () => {
  const links: IFederatedMonitorLinkRepository = {
    create: async () => makeLink(),
    findAll: async () => [],
    findByLocalMonitorId: async () => [makeLink()],
    findById: async () => makeLink(),
    findByFederatedInstanceId: async () => [],
    delete: async () => true,
    markSynced: async () => undefined,
  };
  const federatedInstances: IFederatedInstanceRepository = {
    create: async () => makeInstance(),
    findAll: async () => [],
    findById: async () => makeInstance(),
    countActive: async () => 0,
    revoke: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
  };
  const federatedHeartbeats: IFederatedHeartbeatRepository = {
    insertMany: async () => undefined,
    findLatest: async () => ({ timestamp: new Date(), status: MonitorStatus.DOWN, ping: null }),
    findHistory: async () => [],
  };
  const heartbeats = makeHeartbeatsRepo({ lastStatus: MonitorStatus.UP, lastPing: 20, uptime24h: 1, lastErrorMsg: null });
  const monitors = makeMonitorsRepo();

  const useCase = new GetFederatedComparisonUseCase(links, federatedInstances, federatedHeartbeats, heartbeats, monitors);
  const result = await useCase.execute("admin", [], "monitor-1");

  assert.equal(result.local.status, MonitorStatus.UP);
  assert.equal(result.regions.length, 1);
  assert.equal(result.regions[0].status, MonitorStatus.DOWN);
  assert.equal(result.regions[0].federatedInstanceLabel, "China-VPS1");
  assert.equal(result.combinedStatus, MonitorStatus.DOWN);
});

test("GetFederatedComparisonUseCase sin vinculos: combinado igual al estado local", async () => {
  const links: IFederatedMonitorLinkRepository = {
    create: async () => makeLink(),
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
    findById: async () => null,
    countActive: async () => 0,
    revoke: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
  };
  const federatedHeartbeats: IFederatedHeartbeatRepository = {
    insertMany: async () => undefined,
    findLatest: async () => null,
    findHistory: async () => [],
  };
  const heartbeats = makeHeartbeatsRepo({ lastStatus: MonitorStatus.UP, lastPing: 15, uptime24h: 1, lastErrorMsg: null });
  const monitors = makeMonitorsRepo();

  const useCase = new GetFederatedComparisonUseCase(links, federatedInstances, federatedHeartbeats, heartbeats, monitors);
  const result = await useCase.execute("admin", [], "monitor-1");

  assert.equal(result.regions.length, 0);
  assert.equal(result.combinedStatus, MonitorStatus.UP);
});

test("GetFederatedComparisonUseCase lanza NotFoundError si el monitor no existe o el viewer no tiene permiso", async () => {
  const links: IFederatedMonitorLinkRepository = {
    create: async () => makeLink(),
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
    findById: async () => null,
    countActive: async () => 0,
    revoke: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
  };
  const federatedHeartbeats: IFederatedHeartbeatRepository = {
    insertMany: async () => undefined,
    findLatest: async () => null,
    findHistory: async () => [],
  };
  const heartbeats = makeHeartbeatsRepo({ lastStatus: MonitorStatus.UP, lastPing: 15, uptime24h: 1, lastErrorMsg: null });
  // Monitor pertenece a un grupo que el viewer no tiene autorizado.
  const monitors = makeMonitorsRepo(makeMonitor({ group: "otro-grupo" }));

  const useCase = new GetFederatedComparisonUseCase(links, federatedInstances, federatedHeartbeats, heartbeats, monitors);

  await assert.rejects(
    () => useCase.execute("viewer", [{ type: "group", value: "grupo-autorizado" }], "monitor-1"),
    NotFoundError,
  );
});
