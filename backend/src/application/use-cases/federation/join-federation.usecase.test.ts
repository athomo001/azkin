// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { JoinFederationUseCase } from "./join-federation.usecase";
import {
  CreateFederatedInstanceData,
  IFederatedInstanceRepository,
} from "../../ports/repositories/federated-instance-repository";
import { IFederationClient, RequestEnrollmentInput } from "../../ports/services/federation-client";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { QuotaExceededError, ValidationError } from "../../../domain/errors/domain-error";
import { encryptPrivateKey, decryptPrivateKey } from "../../../infrastructure/security/tls-key-cipher";
import { MAX_FEDERATED_INSTANCES } from "./federation-limits";

const ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
const OWN_URL = "https://china.example.com";

function makeCode(url: string, token: string): string {
  return Buffer.from(JSON.stringify({ url, token })).toString("base64url");
}

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "Chile-VPS1",
    remoteUrl: "https://chile.example.com",
    remoteSecretEncrypted: encryptPrivateKey("placeholder", ENCRYPTION_KEY),
    status: "enrolled",
    createdById: "admin-1",
    createdAt: new Date(),
    revokedAt: null,
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
    ...overrides,
  };
}

function makeFakes(opts: { activeCount?: number } = {}) {
  const created: CreateFederatedInstanceData[] = [];
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
  const clientCalls: RequestEnrollmentInput[] = [];
  const client: IFederationClient = {
    requestEnrollment: async (input) => {
      clientCalls.push(input);
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
  return { federatedInstances, client, auditLog, created, clientCalls };
}

function makeUseCase(
  fakes: ReturnType<typeof makeFakes>,
  resolveOwnUrl: () => Promise<string | null> = async () => OWN_URL,
): JoinFederationUseCase {
  return new JoinFederationUseCase(
    fakes.federatedInstances,
    fakes.client,
    fakes.auditLog,
    resolveOwnUrl,
    encryptPrivateKey,
    ENCRYPTION_KEY,
  );
}

test("JoinFederationUseCase rechaza unirse si no hay dirección propia guardada", async () => {
  const fakes = makeFakes();
  const useCase = makeUseCase(fakes, async () => null);

  await assert.rejects(
    () => useCase.execute({ actorId: "admin-1", code: "cualquiera", peerLabel: "Chile-VPS1", ownLabel: "China-VPS1" }),
    ValidationError,
  );
  assert.equal(fakes.clientCalls.length, 0); // no llama a la remota si falta la dirección propia
});

test("JoinFederationUseCase rechaza un código con formato inválido", async () => {
  const fakes = makeFakes();
  const useCase = makeUseCase(fakes);

  await assert.rejects(
    () =>
      useCase.execute({
        actorId: "admin-1",
        code: "no-es-base64url-valido-!!!",
        peerLabel: "Chile-VPS1",
        ownLabel: "China-VPS1",
      }),
    ValidationError,
  );
});

test("JoinFederationUseCase rechaza al superar la cuota de instancias federadas", async () => {
  const fakes = makeFakes({ activeCount: MAX_FEDERATED_INSTANCES });
  const useCase = makeUseCase(fakes);
  const code = makeCode("https://chile.example.com", "raw-token");

  await assert.rejects(
    () => useCase.execute({ actorId: "admin-1", code, peerLabel: "Chile-VPS1", ownLabel: "China-VPS1" }),
    QuotaExceededError,
  );
});

test("JoinFederationUseCase decodifica el código, genera un secreto compartido, llama a la instancia remota y persiste el registro simétrico cifrado", async () => {
  const fakes = makeFakes();
  const useCase = makeUseCase(fakes);
  const code = makeCode("https://chile.example.com", "raw-token-123");

  const result = await useCase.execute({
    actorId: "admin-2",
    code,
    peerLabel: "Chile-VPS1",
    ownLabel: "China-VPS1",
  });

  assert.equal(fakes.clientCalls.length, 1);
  assert.equal(fakes.clientCalls[0].remoteUrl, "https://chile.example.com");
  assert.equal(fakes.clientCalls[0].token, "raw-token-123");
  assert.equal(fakes.clientCalls[0].callerLabel, "China-VPS1");
  assert.equal(fakes.clientCalls[0].callerUrl, OWN_URL);
  assert.match(fakes.clientCalls[0].callerSecret, /^[0-9a-f]{64}$/);

  assert.equal(fakes.created.length, 1);
  assert.equal(fakes.created[0].label, "Chile-VPS1");
  assert.equal(fakes.created[0].remoteUrl, "https://chile.example.com");
  // el secreto guardado (cifrado) debe descifrar exactamente al mismo que se envió a la remota
  assert.equal(
    decryptPrivateKey(fakes.created[0].remoteSecretEncrypted, ENCRYPTION_KEY),
    fakes.clientCalls[0].callerSecret,
  );
  assert.equal(result.instance.label, "Chile-VPS1");
});
