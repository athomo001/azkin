// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { CreateEnrollmentTokenUseCase } from "./create-enrollment-token.usecase";
import {
  ConsumedFederationEnrollmentToken,
  CreateFederationEnrollmentTokenData,
  IFederationEnrollmentTokenRepository,
} from "../../ports/repositories/federation-enrollment-token-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

function makeFakes() {
  const created: CreateFederationEnrollmentTokenData[] = [];
  const tokens: IFederationEnrollmentTokenRepository = {
    create: async (data) => {
      created.push(data);
    },
    consumeValid: async (): Promise<ConsumedFederationEnrollmentToken | null> => null,
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { tokens, created, auditLog };
}

test("CreateEnrollmentTokenUseCase persiste solo el hash (no el token crudo) y devuelve un código base64url con url+puerto+token", async () => {
  const { tokens, created, auditLog } = makeFakes();
  const useCase = new CreateEnrollmentTokenUseCase(tokens, auditLog, async () => 8444);

  const result = await useCase.execute({ actorId: "admin-1", ownUrl: "https://chile.example.com" });

  assert.equal(created.length, 1);
  assert.equal(created[0].createdById, "admin-1");
  assert.match(created[0].tokenHash, /^[0-9a-f]{64}$/); // sha256 hex

  const decoded = JSON.parse(Buffer.from(result.code, "base64url").toString("utf8"));
  assert.equal(decoded.url, "https://chile.example.com");
  assert.equal(decoded.port, 8444);
  assert.match(decoded.token, /^[0-9a-f]{64}$/); // token crudo, distinto del hash guardado
  assert.notEqual(decoded.token, created[0].tokenHash);
});
