// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DeleteAdminUseCase } from "./delete-admin.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ForbiddenError, NotFoundError } from "../../../domain/errors/domain-error";

function makeUsersRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findByEmail: async () => null,
    findByIdentifier: async () => null,
    findById: async () => null,
    changePassword: async () => true,
    countAdmins: async () => 2,
    findAllAdmins: async () => [],
    updateAdminEmail: async () => null,
    setAdminBlocked: async () => null,
    deleteAdmin: async () => true,
    setPasswordResetToken: async () => undefined,
    findByValidResetTokenHash: async () => null,
    clearPasswordResetToken: async () => undefined,
    createViewer: async () => { throw new Error("not implemented"); },
    findAllViewers: async () => [],
    findViewerById: async () => null,
    updateViewerPermissions: async () => null,
    deleteViewer: async () => true,
    updatePreferences: async () => undefined,
    ...overrides,
  };
}

test("DeleteAdminUseCase registra auditoría al eliminar otra cuenta admin", async () => {
  let auditRecorded: any = null;
  const users = makeUsersRepo({ deleteAdmin: async () => true });
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditRecorded = data;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
  };

  const useCase = new DeleteAdminUseCase(users, auditLog);
  await useCase.execute("admin-1", "admin-2");

  assert.ok(auditRecorded, "se esperaba un registro de auditoría");
  assert.equal(auditRecorded.actorId, "admin-1");
  assert.equal(auditRecorded.action, "ADMIN_DELETE");
  assert.deepEqual(auditRecorded.targetIds, ["admin-2"]);
});

test("DeleteAdminUseCase no permite auto-eliminación y no registra auditoría", async () => {
  let auditCalled = false;
  const users = makeUsersRepo();
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditCalled = true;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
  };

  const useCase = new DeleteAdminUseCase(users, auditLog);
  await assert.rejects(() => useCase.execute("admin-1", "admin-1"), ForbiddenError);
  assert.equal(auditCalled, false);
});

test("DeleteAdminUseCase no registra auditoría si el admin objetivo no existe", async () => {
  let auditCalled = false;
  const users = makeUsersRepo({ deleteAdmin: async () => false });
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditCalled = true;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
  };

  const useCase = new DeleteAdminUseCase(users, auditLog);
  await assert.rejects(() => useCase.execute("admin-1", "no-existe"), NotFoundError);
  assert.equal(auditCalled, false);
});
