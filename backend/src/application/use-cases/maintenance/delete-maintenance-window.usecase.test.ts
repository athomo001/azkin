// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DeleteMaintenanceWindowUseCase } from "./delete-maintenance-window.usecase";
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";
import { NotFoundError } from "../../../domain/errors/domain-error";

const auditLog: IAuditLogRepository = {
  record: async (data) => ({ id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data }),
  listRecent: async () => [],
  listAll: async () => [],
  deleteAll: async () => 0,
};

function makeWindow(): IMaintenanceWindow {
  return {
    id: "w1",
    createdBy: "admin-1",
    name: "Ventana",
    scope: [{ type: "all" }],
    mode: "immediate",
    startAt: null,
    endAt: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeRepo(overrides: Partial<IMaintenanceRepository> = {}): IMaintenanceRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findActive: async () => [],
    findById: async () => null,
    update: async () => null,
    close: async () => null,
    delete: async () => false,
    ...overrides,
  };
}

test("DeleteMaintenanceWindowUseCase elimina una ventana existente", async () => {
  let deletedId: string | null = null;
  const repo = makeRepo({
    findById: async () => makeWindow(),
    delete: async (id) => {
      deletedId = id;
      return true;
    },
  });

  const useCase = new DeleteMaintenanceWindowUseCase(repo, auditLog);
  await useCase.execute("admin-1", "w1");

  assert.equal(deletedId, "w1");
});

test("DeleteMaintenanceWindowUseCase lanza NotFoundError si no existe", async () => {
  const repo = makeRepo({ findById: async () => null });
  const useCase = new DeleteMaintenanceWindowUseCase(repo, auditLog);
  await assert.rejects(() => useCase.execute("admin-1", "no-existe"), NotFoundError);
});
