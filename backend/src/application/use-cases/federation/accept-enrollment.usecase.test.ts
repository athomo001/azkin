// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { AcceptEnrollmentUseCase } from "./accept-enrollment.usecase";
import {
  ConsumedFederationEnrollmentToken,
  IFederationEnrollmentTokenRepository,
} from "../../ports/repositories/federation-enrollment-token-repository";
import {
  CreateFederatedInstanceData,
  IFederatedInstanceRepository,
} from "../../ports/repositories/federated-instance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { encryptPrivateKey, decryptPrivateKey } from "../../../infrastructure/security/tls-key-cipher";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

const ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "China-VPS1",
    remoteUrl: "https://china.example.com",
    remoteSecretEncrypted: encryptPrivateKey("some-secret", ENCRYPTION_KEY),
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
      return makeInstance({ label: data.label, remoteUrl: data.remoteUrl, remoteSecretEncrypted: data.remoteSecretEncrypted });
    },
    findAll: async () => [],
    findById: async () => null,
    countActive: async () => opts.activeCount ?? 0,
    revoke: async () => null,
    findAllActive: async () => [],
    markSyncSuccess: async () => undefined,
    setNotifiedDown: async () => undefined,
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { tokens, federatedInstances, auditLog, created };
}

function makeUseCase(fakes: ReturnType<typeof makeFakes>): AcceptEnrollmentUseCase {
  return new AcceptEnrollmentUseCase(fakes.tokens, fakes.federatedInstances, fakes.auditLog, encryptPrivateKey, ENCRYPTION_KEY);
}

test("AcceptEnrollmentUseCase rechaza un token inválido/expirado/reusado con un error genérico", async () => {
  const fakes = makeFakes({ validToken: null });
  const useCase = makeUseCase(fakes);

  await assert.rejects(
    () =>
      useCase.execute({
        token: "cualquier-token",
        callerLabel: "China-VPS1",
        callerUrl: "https://china.example.com",
        callerSecret: "secreto-del-que-se-une",
      }),
    ValidationError,
  );
});

test("AcceptEnrollmentUseCase rechaza al superar la cuota de instancias federadas", async () => {
  const fakes = makeFakes({ activeCount: MAX_FEDERATED_INSTANCES });
  const useCase = makeUseCase(fakes);

  await assert.rejects(
    () =>
      useCase.execute({
        token: "token-valido",
        callerLabel: "China-VPS1",
        callerUrl: "https://china.example.com",
        callerSecret: "secreto-del-que-se-une",
      }),
    QuotaExceededError,
  );
});

test("AcceptEnrollmentUseCase crea la instancia federada con el secreto del llamador cifrado en reposo", async () => {
  const fakes = makeFakes();
  const useCase = makeUseCase(fakes);

  await useCase.execute({
    token: "token-valido",
    callerLabel: "China-VPS1",
    callerUrl: "https://china.example.com",
    callerSecret: "secreto-del-que-se-une",
  });

  assert.equal(fakes.created.length, 1);
  assert.equal(fakes.created[0].label, "China-VPS1");
  assert.equal(fakes.created[0].remoteUrl, "https://china.example.com");
  assert.equal(fakes.created[0].createdById, "admin-1"); // viene del token consumido, no de una sesión
  assert.equal(decryptPrivateKey(fakes.created[0].remoteSecretEncrypted, ENCRYPTION_KEY), "secreto-del-que-se-une");
});
