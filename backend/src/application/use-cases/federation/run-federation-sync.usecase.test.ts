// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RunFederationSyncUseCase } from "./run-federation-sync.usecase";
import {
  CreateFederatedInstanceData,
  IFederatedInstanceRepository,
} from "../../ports/repositories/federated-instance-repository";
import { IFederatedMonitorLinkRepository } from "../../ports/repositories/federated-monitor-link-repository";
import {
  CreateFederatedHeartbeatData,
  IFederatedHeartbeatRepository,
} from "../../ports/repositories/federated-heartbeat-repository";
import { IFederationClient } from "../../ports/services/federation-client";
import { IMailer, SendMailInput } from "../../ports/services/mailer";
import { ResolveDefaultAlertRecipients } from "../../services/resolve-default-alert-recipients";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";
import { FEDERATION_REPORTING_THRESHOLD_SECONDS } from "./federation-limits";

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "China-VPS1",
    remoteUrl: "https://china.example.com",
    remoteSecretEncrypted: "encrypted-placeholder",
    status: "enrolled",
    createdById: "admin-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
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
    lastSyncedAt: null,
    ...overrides,
  };
}

function makeFakeMailer() {
  const sent: SendMailInput[] = [];
  const mailer: IMailer = {
    send: async (input) => {
      sent.push(input);
    },
  };
  return { mailer, sent };
}

function makeFakeResolver(recipients: string[]): ResolveDefaultAlertRecipients {
  return { resolve: async () => recipients } as unknown as ResolveDefaultAlertRecipients;
}

test("RunFederationSyncUseCase no hace nada si la instancia no tiene ningun vinculo", async () => {
  const federatedInstances: IFederatedInstanceRepository = {
    create: async () => makeInstance(),
    findAll: async () => [],
    findById: async () => null,
    countActive: async () => 0,
    revoke: async () => null,
    findAllActive: async () => [makeInstance()],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
  };
  const links: IFederatedMonitorLinkRepository = {
    create: async () => makeLink(),
    findAll: async () => [],
    findByLocalMonitorId: async () => [],
    findById: async () => null,
    findByFederatedInstanceId: async () => [],
    delete: async () => true,
    markSynced: async () => undefined,
  };
  const federatedHeartbeats: IFederatedHeartbeatRepository = {
    insertMany: async () => undefined,
    findLatest: async () => null,
  };
  const client: IFederationClient = {
    requestEnrollment: async () => {
      throw new Error("no debería llamarse");
    },
    listRemoteMonitors: async () => [],
    syncHeartbeats: async () => {
      throw new Error("no debería llamarse, la instancia no tiene vinculos");
    },
  };
  const { mailer, sent } = makeFakeMailer();
  const useCase = new RunFederationSyncUseCase(
    federatedInstances,
    links,
    federatedHeartbeats,
    client,
    mailer,
    makeFakeResolver(["admin@test.local"]),
    (enc) => enc,
    "identity-key",
  );

  await useCase.execute();

  assert.equal(sent.length, 0);
});

test("RunFederationSyncUseCase persiste heartbeats, marca sincronizacion exitosa y limpia notifiedDown si estaba en down", async () => {
  const instance = makeInstance({ notifiedDown: true });
  const link = makeLink();
  const markSyncSuccessCalls: { id: string; at: Date }[] = [];
  const setNotifiedDownCalls: { id: string; value: boolean }[] = [];
  const markSyncedCalls: string[] = [];
  const inserted: CreateFederatedHeartbeatData[] = [];

  const federatedInstances: IFederatedInstanceRepository = {
    create: async () => instance,
    findAll: async () => [instance],
    findById: async () => instance,
    countActive: async () => 1,
    revoke: async () => null,
    findAllActive: async () => [instance],
    markSyncSuccess: async (id, at) => {
      markSyncSuccessCalls.push({ id, at });
    },
    setNotifiedDown: async (id, value) => {
      setNotifiedDownCalls.push({ id, value });
    },
  };
  const links: IFederatedMonitorLinkRepository = {
    create: async () => link,
    findAll: async () => [link],
    findByLocalMonitorId: async () => [link],
    findById: async () => link,
    findByFederatedInstanceId: async () => [link],
    delete: async () => true,
    markSynced: async (id) => {
      markSyncedCalls.push(id);
    },
  };
  const federatedHeartbeats: IFederatedHeartbeatRepository = {
    insertMany: async (data) => {
      inserted.push(...data);
    },
    findLatest: async () => null,
  };
  const client: IFederationClient = {
    requestEnrollment: async () => {
      throw new Error("no debería llamarse");
    },
    listRemoteMonitors: async () => [],
    syncHeartbeats: async () => [
      { timestamp: new Date().toISOString(), status: 1, ping: 42 },
    ],
  };
  const { mailer, sent } = makeFakeMailer();
  const useCase = new RunFederationSyncUseCase(
    federatedInstances,
    links,
    federatedHeartbeats,
    client,
    mailer,
    makeFakeResolver(["admin@test.local"]),
    (enc) => enc,
    "identity-key",
  );

  await useCase.execute();

  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].federatedMonitorLinkId, "link-1");
  assert.equal(markSyncedCalls.length, 1);
  assert.equal(markSyncSuccessCalls.length, 1);
  assert.equal(setNotifiedDownCalls.length, 1);
  assert.equal(setNotifiedDownCalls[0].value, false);
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /recuperada/i);
});

test("RunFederationSyncUseCase notifica 'sin reportar' solo tras superar el umbral, y solo una vez", async () => {
  const overdueInstance = makeInstance({
    lastSuccessfulSyncAt: new Date(Date.now() - (FEDERATION_REPORTING_THRESHOLD_SECONDS + 60) * 1000),
    notifiedDown: false,
  });
  const link = makeLink();
  const setNotifiedDownCalls: boolean[] = [];

  const federatedInstances: IFederatedInstanceRepository = {
    create: async () => overdueInstance,
    findAll: async () => [overdueInstance],
    findById: async () => overdueInstance,
    countActive: async () => 1,
    revoke: async () => null,
    findAllActive: async () => [overdueInstance],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async (_id, value) => {
      setNotifiedDownCalls.push(value);
    },
  };
  const links: IFederatedMonitorLinkRepository = {
    create: async () => link,
    findAll: async () => [link],
    findByLocalMonitorId: async () => [link],
    findById: async () => link,
    findByFederatedInstanceId: async () => [link],
    delete: async () => true,
    markSynced: async () => undefined,
  };
  const federatedHeartbeats: IFederatedHeartbeatRepository = {
    insertMany: async () => undefined,
    findLatest: async () => null,
  };
  const client: IFederationClient = {
    requestEnrollment: async () => {
      throw new Error("no debería llamarse");
    },
    listRemoteMonitors: async () => [],
    syncHeartbeats: async () => {
      throw new Error("peer inalcanzable");
    },
  };
  const { mailer, sent } = makeFakeMailer();
  const useCase = new RunFederationSyncUseCase(
    federatedInstances,
    links,
    federatedHeartbeats,
    client,
    mailer,
    makeFakeResolver(["admin@test.local"]),
    (enc) => enc,
    "identity-key",
  );

  await useCase.execute();

  assert.equal(setNotifiedDownCalls.length, 1);
  assert.equal(setNotifiedDownCalls[0], true);
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /sin reportar/i);
});
