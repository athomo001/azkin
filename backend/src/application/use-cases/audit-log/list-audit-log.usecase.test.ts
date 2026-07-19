// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ListAuditLogUseCase } from "./list-audit-log.usecase";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLog } from "../../../domain/entities/audit-log";
import { IUser } from "../../../domain/entities/user";

function makeAdmin(id: string, email: string): IUser {
  return {
    id,
    email,
    passwordHash: "hashed",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeEntry(actorId: string): IAuditLog {
  return {
    id: "entry-1",
    actorId,
    action: "MONITORS_BULK_DELETE",
    targetType: "monitor",
    targetIds: ["m1", "m2"],
    createdAt: new Date(),
  };
}

test("ListAuditLogUseCase resuelve el email del actor para cada entrada", async () => {
  const admin1 = makeAdmin("admin-1", "admin1@azkin.test");
  const entry = makeEntry("admin-1");

  const auditLogRepo: IAuditLogRepository = {
    record: async () => entry,
    listRecent: async () => [entry],
    listAll: async () => [entry],
  };
  const users: IUserRepository = {
    findAllAdmins: async () => [admin1],
  } as unknown as IUserRepository;

  const useCase = new ListAuditLogUseCase(auditLogRepo, users);
  const result = await useCase.execute();

  assert.equal(result.length, 1);
  assert.equal(result[0].actorEmail, "admin1@azkin.test");
  assert.equal(result[0].action, "MONITORS_BULK_DELETE");
});

test("ListAuditLogUseCase marca 'Administrador eliminado' si el actor ya no existe", async () => {
  const entry = makeEntry("admin-borrado");

  const auditLogRepo: IAuditLogRepository = {
    record: async () => entry,
    listRecent: async () => [entry],
    listAll: async () => [entry],
  };
  const users: IUserRepository = {
    findAllAdmins: async () => [],
  } as unknown as IUserRepository;

  const useCase = new ListAuditLogUseCase(auditLogRepo, users);
  const result = await useCase.execute();

  assert.equal(result[0].actorEmail, "Administrador eliminado");
});
