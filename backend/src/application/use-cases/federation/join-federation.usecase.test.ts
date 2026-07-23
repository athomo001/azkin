// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { JoinFederationUseCase } from "./join-federation.usecase";
import {
  CreateFederatedInstanceData,
  IFederatedInstanceRepository,
} from "../../ports/repositories/federated-instance-repository";
import { IFederationIdentityService } from "../../ports/services/federation-identity";
import { IFederationClient, RequestEnrollmentInput } from "../../ports/services/federation-client";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { generateSelfSignedCertificate } from "../../../infrastructure/security/federation-certificate-generator";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

const VALID_CERT_PEM = generateSelfSignedCertificate("remote-test").certPem;
const OWN_FEDERATION_PORT = 8444;

function makeCode(url: string, token: string): string {
  return Buffer.from(JSON.stringify({ url, token })).toString("base64url");
}

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "Chile-VPS1",
    remoteUrl: "https://chile.example.com",
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

function makeFakes(opts: { activeCount?: number; remoteCertPem?: string; remoteFederationPort?: number } = {}) {
  const created: CreateFederatedInstanceData[] = [];
  const federatedInstances: IFederatedInstanceRepository = {
    create: async (data) => {
      created.push(data);
      return makeInstance({
        label: data.label,
        remoteUrl: data.remoteUrl,
        remoteFederationPort: data.remoteFederationPort,
        peerCertFingerprint: data.peerCertFingerprint,
      });
    },
    findAll: async () => [],
    findById: async () => null,
    countActive: async () => opts.activeCount ?? 0,
    revoke: async () => null,
    findEnrolledByFingerprint: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
  };
  const identity: IFederationIdentityService = {
    getOrCreateOwnCertificate: async () => ({ certPem: "own-cert-pem", fingerprint: "own-fp" }),
    getOwnServerCredentials: async () => ({ certPem: "own-cert-pem", keyPem: "own-key-pem", fingerprint: "own-fp" }),
  };
  const clientCalls: RequestEnrollmentInput[] = [];
  const client: IFederationClient = {
    requestEnrollment: async (input) => {
      clientCalls.push(input);
      return {
        ownCertPem: opts.remoteCertPem ?? VALID_CERT_PEM,
        ownFederationPort: opts.remoteFederationPort ?? 8555,
      };
    },
    listRemoteMonitors: async () => [],
    syncHeartbeats: async () => [],
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { federatedInstances, identity, client, auditLog, created, clientCalls };
}

test("JoinFederationUseCase rechaza un código con formato inválido", async () => {
  const { federatedInstances, identity, client, auditLog } = makeFakes();
  const useCase = new JoinFederationUseCase(federatedInstances, identity, client, auditLog, async () => OWN_FEDERATION_PORT);

  await assert.rejects(
    () =>
      useCase.execute({
        actorId: "admin-1",
        code: "no-es-base64url-valido-!!!",
        peerLabel: "Chile-VPS1",
        ownLabel: "China-VPS1",
        ownUrl: "https://china.example.com",
      }),
    ValidationError,
  );
});

test("JoinFederationUseCase rechaza al superar la cuota de instancias federadas", async () => {
  const { federatedInstances, identity, client, auditLog } = makeFakes({ activeCount: MAX_FEDERATED_INSTANCES });
  const useCase = new JoinFederationUseCase(federatedInstances, identity, client, auditLog, async () => OWN_FEDERATION_PORT);
  const code = makeCode("https://chile.example.com", "raw-token");

  await assert.rejects(
    () =>
      useCase.execute({
        actorId: "admin-1",
        code,
        peerLabel: "Chile-VPS1",
        ownLabel: "China-VPS1",
        ownUrl: "https://china.example.com",
      }),
    QuotaExceededError,
  );
});

test("JoinFederationUseCase decodifica el código, llama a la instancia remota (con el puerto propio) y persiste el registro simétrico", async () => {
  const { federatedInstances, identity, client, auditLog, created, clientCalls } = makeFakes({ remoteFederationPort: 9001 });
  const useCase = new JoinFederationUseCase(federatedInstances, identity, client, auditLog, async () => OWN_FEDERATION_PORT);
  const code = makeCode("https://chile.example.com", "raw-token-123");

  const result = await useCase.execute({
    actorId: "admin-2",
    code,
    peerLabel: "Chile-VPS1",
    ownLabel: "China-VPS1",
    ownUrl: "https://china.example.com",
  });

  assert.equal(clientCalls.length, 1);
  assert.equal(clientCalls[0].remoteUrl, "https://chile.example.com");
  assert.equal(clientCalls[0].token, "raw-token-123");
  assert.equal(clientCalls[0].callerCertPem, "own-cert-pem");
  assert.equal(clientCalls[0].callerLabel, "China-VPS1");
  assert.equal(clientCalls[0].callerFederationPort, OWN_FEDERATION_PORT);

  assert.equal(created.length, 1);
  assert.equal(created[0].label, "Chile-VPS1");
  assert.equal(created[0].remoteUrl, "https://chile.example.com");
  assert.equal(created[0].remoteFederationPort, 9001);
  assert.equal(result.instance.label, "Chile-VPS1");
});
