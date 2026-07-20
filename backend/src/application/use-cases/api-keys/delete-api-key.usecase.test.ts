// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DeleteApiKeyUseCase } from "./delete-api-key.usecase";
import { IApiKeyRepository, CreateApiKeyData } from "../../ports/repositories/api-key-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IApiKey } from "../../../domain/entities/api-key";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeApiKeysRepo(overrides: Partial<IApiKeyRepository> = {}): IApiKeyRepository {
  return {
    create: async (_data: CreateApiKeyData) => { throw new Error("not implemented"); },
    findByHash: async () => null,
    findAllByAdmin: async () => [] as IApiKey[],
    revoke: async () => true,
    delete: async () => true,
    touchLastUsed: async () => undefined,
    ...overrides,
  };
}

test("DeleteApiKeyUseCase elimina la key y registra auditoría", async () => {
  let auditRecorded: any = null;
  const apiKeys = makeApiKeysRepo({ delete: async () => true });
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditRecorded = data;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
  };

  const useCase = new DeleteApiKeyUseCase(apiKeys, auditLog);
  await useCase.execute("admin-1", "key-1");

  assert.ok(auditRecorded, "se esperaba un registro de auditoría");
  assert.equal(auditRecorded.actorId, "admin-1");
  assert.equal(auditRecorded.action, "API_KEY_DELETE");
  assert.deepEqual(auditRecorded.targetIds, ["key-1"]);
});

test("DeleteApiKeyUseCase lanza NotFoundError y no registra auditoría si la key no existe o no es del admin", async () => {
  let auditCalled = false;
  const apiKeys = makeApiKeysRepo({ delete: async () => false });
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditCalled = true;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
  };

  const useCase = new DeleteApiKeyUseCase(apiKeys, auditLog);
  await assert.rejects(() => useCase.execute("admin-1", "no-existe"), NotFoundError);
  assert.equal(auditCalled, false);
});
