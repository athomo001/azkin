// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DeleteBackupUseCase } from "./delete-backup.usecase";
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeBackupsRepo(deleteById: IBackupRepository["deleteById"]): IBackupRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findById: async () => null,
    deleteAll: async () => 0,
    deleteById,
  };
}

test("DeleteBackupUseCase elimina el respaldo y registra auditoría", async () => {
  let auditRecorded: any = null;
  const backups = makeBackupsRepo(async () => true);
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditRecorded = data;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new DeleteBackupUseCase(backups, auditLog);
  await useCase.execute("admin-1", "backup-1");

  assert.ok(auditRecorded, "se esperaba un registro de auditoría");
  assert.equal(auditRecorded.action, "BACKUP_DELETE");
  assert.deepEqual(auditRecorded.targetIds, ["backup-1"]);
});

test("DeleteBackupUseCase lanza NotFoundError y no registra auditoría si el respaldo no existe", async () => {
  let auditCalled = false;
  const backups = makeBackupsRepo(async () => false);
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      auditCalled = true;
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };

  const useCase = new DeleteBackupUseCase(backups, auditLog);
  await assert.rejects(() => useCase.execute("admin-1", "no-existe"), NotFoundError);
  assert.equal(auditCalled, false);
});
