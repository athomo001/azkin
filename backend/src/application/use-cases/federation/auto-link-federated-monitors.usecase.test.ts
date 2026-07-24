// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { AutoLinkFederatedMonitorsUseCase } from "./auto-link-federated-monitors.usecase";
import { ListRemoteMonitorsUseCase } from "./list-remote-monitors.usecase";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository, CreateFederatedMonitorLinkData } from "../../ports/repositories/federated-monitor-link-repository";
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IHeartbeatRepository } from "../../ports/repositories/heartbeat-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IMonitor } from "../../../domain/entities/monitor";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "Node 1",
    remoteUrl: "https://node1.example.com",
    remoteSecretEncrypted: "encrypted",
    status: "enrolled",
    createdById: "admin-1",
    createdAt: new Date(),
    revokedAt: null,
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
    ...overrides,
  };
}

test("AutoLinkFederatedMonitorsUseCase importa monitores nuevos e inicializa su heartbeat", async () => {
  const createdMonitors: CreateMonitorData[] = [];
  const savedHeartbeats: any[] = [];
  const createdLinks: CreateFederatedMonitorLinkData[] = [];

  const federatedInstances: IFederatedInstanceRepository = {
    findById: async () => makeInstance(),
    findAll: async () => [],
    countActive: async () => 1,
    revoke: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
    create: async () => makeInstance(),
  };

  const monitors: IMonitorRepository = {
    findAll: async () => [],
    create: async (data) => {
      createdMonitors.push(data);
      return { id: `local-${data.name}`, ...data, isActive: true } as IMonitor;
    },
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    bulkDelete: async () => 0,
  };

  const heartbeats: IHeartbeatRepository = {
    save: async (data) => {
      savedHeartbeats.push(data);
      return data as any;
    },
    getSummaries: async () => ({}),
    findHistory: async () => [],
    findRecent: async () => [],
    getIncidentLog: async () => [],
    getAvailabilityKPI: async () => 100,
    getUptimeStats: async () => ({ uptimeSeconds: 100, downtimeSeconds: 0 }),
    findRecentIncidents: async () => [],
  };

  const links: IFederatedMonitorLinkRepository = {
    create: async (data) => {
      createdLinks.push(data);
      return { id: `link-${data.localMonitorId}`, ...data } as IFederatedMonitorLink;
    },
    findByFederatedInstanceId: async () => [],
    findByLocalMonitorId: async () => [],
    markSynced: async () => undefined,
    delete: async () => true,
    deleteByFederatedInstanceId: async () => 0,
  };

  const listRemoteMonitors = {
    execute: async () => [
      { id: "remote-1", name: "anime", type: "http", target: "https://animeav1.com", lastStatus: 1, lastPing: 1122 },
    ],
  } as unknown as ListRemoteMonitorsUseCase;

  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new AutoLinkFederatedMonitorsUseCase(
    federatedInstances,
    links,
    monitors,
    listRemoteMonitors,
    auditLog,
    heartbeats,
  );

  const result = await useCase.execute("admin-1", "instance-1");

  assert.equal(result.linkedCount, 1);
  assert.equal(createdMonitors.length, 1);
  assert.equal(createdMonitors[0].name, "anime");
  assert.equal(savedHeartbeats.length, 1);
  assert.equal(savedHeartbeats[0].monitorId, "local-anime");
  assert.equal(savedHeartbeats[0].status, "UP");
  assert.equal(savedHeartbeats[0].ping, 1122);
});

test("AutoLinkFederatedMonitorsUseCase previene creaciones duplicadas ante ejecuciones concurrentes", async () => {
  const createdMonitors: CreateMonitorData[] = [];
  const localList: IMonitor[] = [];

  const federatedInstances: IFederatedInstanceRepository = {
    findById: async () => makeInstance(),
    findAll: async () => [],
    countActive: async () => 1,
    revoke: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
    create: async () => makeInstance(),
  };

  const monitors: IMonitorRepository = {
    findAll: async () => localList,
    create: async (data) => {
      createdMonitors.push(data);
      const newMon = { id: `local-${data.name}`, ...data, isActive: true } as IMonitor;
      localList.push(newMon);
      return newMon;
    },
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    bulkDelete: async () => 0,
  };

  const links: IFederatedMonitorLinkRepository = {
    create: async (data) => ({ id: `link-${data.localMonitorId}`, ...data } as IFederatedMonitorLink),
    findByFederatedInstanceId: async () => [],
    findByLocalMonitorId: async () => [],
    markSynced: async () => undefined,
    delete: async () => true,
    deleteByFederatedInstanceId: async () => 0,
  };

  const listRemoteMonitors = {
    execute: async () => [
      { id: "remote-1", name: "anime", type: "http", target: "https://animeav1.com", lastStatus: 1, lastPing: 1122 },
    ],
  } as unknown as ListRemoteMonitorsUseCase;

  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new AutoLinkFederatedMonitorsUseCase(
    federatedInstances,
    links,
    monitors,
    listRemoteMonitors,
    auditLog,
  );

  // Ejecutamos en paralelo para simular la condición de carrera
  const [res1, res2] = await Promise.all([
    useCase.execute("admin-1", "instance-1"),
    useCase.execute("admin-1", "instance-1"),
  ]);

  // Debe haberse creado exactamente 1 monitor y no 2
  assert.equal(createdMonitors.length, 1);
});
