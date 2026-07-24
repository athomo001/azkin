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
  // Debe ser el enum numérico real (MonitorStatus.UP = 1), no el string "UP": el schema de Mongo
  // define `status` como Number — guardar un string revienta con CastError en producción (AZ-050).
  assert.equal(savedHeartbeats[0].status, 1);
  assert.equal(typeof savedHeartbeats[0].status, "number");
  assert.equal(savedHeartbeats[0].ping, 1122);
});

test("AutoLinkFederatedMonitorsUseCase inicializa el heartbeat aunque el remoto esté DOWN (status numérico 0, falsy en JS)", async () => {
  const savedHeartbeats: any[] = [];

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
    create: async (data) => ({ id: `local-${data.name}`, ...data, isActive: true } as IMonitor),
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
    create: async (data) => ({ id: `link-${data.localMonitorId}`, ...data } as IFederatedMonitorLink),
    findByFederatedInstanceId: async () => [],
    findByLocalMonitorId: async () => [],
    markSynced: async () => undefined,
    delete: async () => true,
    deleteByFederatedInstanceId: async () => 0,
  };

  const listRemoteMonitors = {
    execute: async () => [
      { id: "remote-1", name: "sitio-caido", type: "http", target: "https://caido.com", lastStatus: 0, lastPing: null },
    ],
  } as unknown as ListRemoteMonitorsUseCase;

  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new AutoLinkFederatedMonitorsUseCase(federatedInstances, links, monitors, listRemoteMonitors, auditLog, heartbeats);

  await useCase.execute("admin-1", "instance-1");

  assert.equal(savedHeartbeats.length, 1, "un remoto DOWN (status 0) tambien debe inicializar el heartbeat local");
  assert.equal(savedHeartbeats[0].status, 0);
});

test("AutoLinkFederatedMonitorsUseCase importa el resto del lote aunque un monitor remoto falle (AZ-050: 3 remotos, 1 inválido -> se importan los otros 2)", async () => {
  const createdMonitors: CreateMonitorData[] = [];
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
      // Simula la validación real del schema: type "port" exige el campo `port`.
      if (data.type === "port" && !data.port) {
        throw new Error("Monitor validation failed: port: Path `port` is required.");
      }
      createdMonitors.push(data);
      return { id: `local-${data.name}`, ...data, isActive: true } as IMonitor;
    },
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    bulkDelete: async () => 0,
  };

  const heartbeats: IHeartbeatRepository = {
    save: async (data) => data as any,
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
      { id: "remote-1", name: "sitio-web", type: "http", target: "https://sitio.com", lastStatus: 1, lastPing: 100 },
      { id: "remote-2", name: "servidor-tcp", type: "port", target: "10.0.0.5", lastStatus: 1, lastPing: 5 },
      { id: "remote-3", name: "ping-router", type: "ping", target: "10.0.0.1", lastStatus: 1, lastPing: 3 },
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

  assert.equal(result.linkedCount, 2, "los 2 monitores válidos deben importarse pese al fallo del tercero");
  assert.equal(result.failedCount, 1);
  assert.equal(result.failures[0].remoteMonitorName, "servidor-tcp");
  assert.equal(createdMonitors.length, 2);
  assert.equal(createdLinks.length, 2);
});

test("AutoLinkFederatedMonitorsUseCase propaga el puerto remoto para poder crear monitores tipo \"port\"", async () => {
  const createdMonitors: CreateMonitorData[] = [];

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
      { id: "remote-1", name: "servidor-tcp", type: "port", target: "10.0.0.5", port: 3306, lastStatus: 1, lastPing: 5 },
    ],
  } as unknown as ListRemoteMonitorsUseCase;

  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new AutoLinkFederatedMonitorsUseCase(federatedInstances, links, monitors, listRemoteMonitors, auditLog);

  const result = await useCase.execute("admin-1", "instance-1");

  assert.equal(result.failedCount, 0);
  assert.equal(result.linkedCount, 1);
  assert.equal(createdMonitors[0].port, 3306);
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
