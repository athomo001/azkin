// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RevokeFederatedInstanceUseCase } from "./revoke-federated-instance.usecase";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "China-VPS1",
    remoteUrl: "https://china.example.com",
    peerCertFingerprint: "aa:bb",
    status: "revoked",
    createdById: "admin-1",
    createdAt: new Date(),
    revokedAt: new Date(),
    ...overrides,
  };
}

test("RevokeFederatedInstanceUseCase lanza NotFoundError si la instancia no existe", async () => {
  const federatedInstances: IFederatedInstanceRepository = {
    create: async () => makeInstance(),
    findAll: async () => [],
    findById: async () => null,
    countActive: async () => 0,
    revoke: async () => null,
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  const useCase = new RevokeFederatedInstanceUseCase(federatedInstances, auditLog);

  await assert.rejects(() => useCase.execute("admin-1", "no-existe"), NotFoundError);
});

test("RevokeFederatedInstanceUseCase revoca y registra auditoría", async () => {
  const auditCalls: unknown[] = [];
  const federatedInstances: IFederatedInstanceRepository = {
    create: async () => makeInstance(),
    findAll: async () => [],
    findById: async () => null,
    countActive: async () => 0,
    revoke: async (id) => makeInstance({ id }),
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditCalls.push(data);
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  const useCase = new RevokeFederatedInstanceUseCase(federatedInstances, auditLog);

  const result = await useCase.execute("admin-1", "instance-1");

  assert.equal(result.status, "revoked");
  assert.equal(auditCalls.length, 1);
});
