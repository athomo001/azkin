// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DeleteViewerUseCase } from "./delete-viewer.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeUsersRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findByEmail: async () => null,
    findByIdentifier: async () => null,
    findById: async () => null,
    changePassword: async () => true,
    countAdmins: async () => 1,
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

test("DeleteViewerUseCase registra auditoría al eliminar un viewer", async () => {
  let auditRecorded: any = null;
  const users = makeUsersRepo({ deleteViewer: async () => true });
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditRecorded = data;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
  };

  const useCase = new DeleteViewerUseCase(users, auditLog);
  await useCase.execute("admin-1", "viewer-1");

  assert.ok(auditRecorded, "se esperaba un registro de auditoría");
  assert.equal(auditRecorded.actorId, "admin-1");
  assert.equal(auditRecorded.action, "VIEWER_DELETE");
  assert.deepEqual(auditRecorded.targetIds, ["viewer-1"]);
});

test("DeleteViewerUseCase no registra auditoría si el viewer no existe", async () => {
  let auditCalled = false;
  const users = makeUsersRepo({ deleteViewer: async () => false });
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditCalled = true;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
  };

  const useCase = new DeleteViewerUseCase(users, auditLog);
  await assert.rejects(() => useCase.execute("admin-1", "no-existe"), NotFoundError);
  assert.equal(auditCalled, false);
});
