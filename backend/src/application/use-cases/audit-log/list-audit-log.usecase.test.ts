// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ListAuditLogUseCase } from "./list-audit-log.usecase";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLog } from "../../../domain/entities/audit-log";
import { IUser } from "../../../domain/entities/user";

function makeUser(id: string, overrides: Partial<IUser> = {}): IUser {
  return {
    id,
    email: `${id}@azkin.test`,
    passwordHash: "hashed",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeEntry(overrides: Partial<IAuditLog> = {}): IAuditLog {
  return {
    id: "entry-1",
    actorId: "admin-1",
    action: "MONITORS_BULK_DELETE",
    targetType: "monitor",
    targetIds: ["m1", "m2"],
    metadata: {},
    createdAt: new Date(),
    ...overrides,
  };
}

function makeUsersRepo(usersById: Map<string, IUser>): IUserRepository {
  return {
    findById: async (id: string) => usersById.get(id) ?? null,
  } as unknown as IUserRepository;
}

test("ListAuditLogUseCase resuelve el email del actor para cada entrada", async () => {
  const admin1 = makeUser("admin-1", { email: "admin1@azkin.test" });
  const entry = makeEntry({ actorId: "admin-1" });

  const auditLogRepo: IAuditLogRepository = {
    record: async () => entry,
    listRecent: async () => [entry],
    listAll: async () => [entry],
    deleteAll: async () => 0,
  };
  const users = makeUsersRepo(new Map([["admin-1", admin1]]));

  const useCase = new ListAuditLogUseCase(auditLogRepo, users);
  const result = await useCase.execute();

  assert.equal(result.length, 1);
  assert.equal(result[0].actorEmail, "admin1@azkin.test");
  assert.equal(result[0].action, "MONITORS_BULK_DELETE");
});

test("ListAuditLogUseCase marca 'Usuario eliminado' si el actor ya no existe", async () => {
  const entry = makeEntry({ actorId: "admin-borrado" });

  const auditLogRepo: IAuditLogRepository = {
    record: async () => entry,
    listRecent: async () => [entry],
    listAll: async () => [entry],
    deleteAll: async () => 0,
  };
  const users = makeUsersRepo(new Map());

  const useCase = new ListAuditLogUseCase(auditLogRepo, users);
  const result = await useCase.execute();

  assert.equal(result[0].actorEmail, "Usuario eliminado");
});

test("ListAuditLogUseCase resuelve correctamente el email de un actor Viewer (no solo Admins)", async () => {
  const viewer = makeUser("viewer-1", { role: "viewer", email: undefined, username: "viewer-tv" });
  const entry = makeEntry({ actorId: "viewer-1", action: "LOGIN_SUCCESS", targetType: "user" });

  const auditLogRepo: IAuditLogRepository = {
    record: async () => entry,
    listRecent: async () => [entry],
    listAll: async () => [entry],
    deleteAll: async () => 0,
  };
  const users = makeUsersRepo(new Map([["viewer-1", viewer]]));

  const useCase = new ListAuditLogUseCase(auditLogRepo, users);
  const result = await useCase.execute();

  assert.equal(result[0].actorEmail, "viewer-tv");
});

test("ListAuditLogUseCase usa attemptedIdentifier cuando actorId es nulo (login fallido con identificador desconocido)", async () => {
  const entry = makeEntry({
    actorId: null,
    action: "LOGIN_FAILED",
    targetType: "user",
    targetIds: [],
    metadata: { attemptedIdentifier: "nadie@azkin.test", reason: "unknown_identifier" },
  });

  const auditLogRepo: IAuditLogRepository = {
    record: async () => entry,
    listRecent: async () => [entry],
    listAll: async () => [entry],
    deleteAll: async () => 0,
  };
  const users = makeUsersRepo(new Map());

  const useCase = new ListAuditLogUseCase(auditLogRepo, users);
  const result = await useCase.execute();

  assert.equal(result[0].actorEmail, "nadie@azkin.test");
});
