// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { AcceptEnrollmentUseCase } from "./accept-enrollment.usecase";
import {
  ConsumedFederationEnrollmentToken,
  IFederationEnrollmentTokenRepository,
} from "../../ports/repositories/federation-enrollment-token-repository";
import {
  CreateFederatedInstanceData,
  IFederatedInstanceRepository,
} from "../../ports/repositories/federated-instance-repository";
import { IFederationIdentityService } from "../../ports/services/federation-identity";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { generateSelfSignedCertificate } from "../../../infrastructure/security/federation-certificate-generator";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

const VALID_CERT_PEM = generateSelfSignedCertificate("peer-test").certPem;
const OWN_FEDERATION_PORT = 8444;

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

function makeFakes(opts: { activeCount?: number; validToken?: ConsumedFederationEnrollmentToken | null } = {}) {
  const created: CreateFederatedInstanceData[] = [];
  const tokens: IFederationEnrollmentTokenRepository = {
    create: async () => undefined,
    consumeValid: async () => (opts.validToken === undefined ? { createdById: "admin-1" } : opts.validToken),
  };
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
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { tokens, federatedInstances, identity, auditLog, created };
}

test("AcceptEnrollmentUseCase rechaza un token inválido/expirado/reusado con un error genérico", async () => {
  const { tokens, federatedInstances, identity, auditLog } = makeFakes({ validToken: null });
  const useCase = new AcceptEnrollmentUseCase(tokens, federatedInstances, identity, auditLog, async () => OWN_FEDERATION_PORT);

  await assert.rejects(
    () =>
      useCase.execute({
        token: "cualquier-token",
        callerCertPem: VALID_CERT_PEM,
        callerLabel: "China-VPS1",
        callerUrl: "https://china.example.com",
        callerFederationPort: 8444,
      }),
    ValidationError,
  );
});

test("AcceptEnrollmentUseCase rechaza al superar la cuota de instancias federadas", async () => {
  const { tokens, federatedInstances, identity, auditLog } = makeFakes({ activeCount: MAX_FEDERATED_INSTANCES });
  const useCase = new AcceptEnrollmentUseCase(tokens, federatedInstances, identity, auditLog, async () => OWN_FEDERATION_PORT);

  await assert.rejects(
    () =>
      useCase.execute({
        token: "token-valido",
        callerCertPem: VALID_CERT_PEM,
        callerLabel: "China-VPS1",
        callerUrl: "https://china.example.com",
        callerFederationPort: 8444,
      }),
    QuotaExceededError,
  );
});

test("AcceptEnrollmentUseCase rechaza un certificado con formato inválido", async () => {
  const { tokens, federatedInstances, identity, auditLog } = makeFakes();
  const useCase = new AcceptEnrollmentUseCase(tokens, federatedInstances, identity, auditLog, async () => OWN_FEDERATION_PORT);

  await assert.rejects(
    () =>
      useCase.execute({
        token: "token-valido",
        callerCertPem: "no-es-un-certificado",
        callerLabel: "China-VPS1",
        callerUrl: "https://china.example.com",
        callerFederationPort: 8444,
      }),
    ValidationError,
  );
});

test("AcceptEnrollmentUseCase crea la instancia federada y devuelve el certificado + puerto propio", async () => {
  const { tokens, federatedInstances, identity, auditLog, created } = makeFakes();
  const useCase = new AcceptEnrollmentUseCase(tokens, federatedInstances, identity, auditLog, async () => OWN_FEDERATION_PORT);

  const result = await useCase.execute({
    token: "token-valido",
    callerCertPem: VALID_CERT_PEM,
    callerLabel: "China-VPS1",
    callerUrl: "https://china.example.com",
    callerFederationPort: 8555,
  });

  assert.equal(result.ownCertPem, "own-cert-pem");
  assert.equal(result.ownFederationPort, OWN_FEDERATION_PORT);
  assert.equal(created.length, 1);
  assert.equal(created[0].label, "China-VPS1");
  assert.equal(created[0].remoteFederationPort, 8555);
  assert.equal(created[0].createdById, "admin-1"); // viene del token consumido, no de una sesión
});
