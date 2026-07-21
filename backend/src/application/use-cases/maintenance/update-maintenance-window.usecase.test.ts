// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { UpdateMaintenanceWindowUseCase } from "./update-maintenance-window.usecase";
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

function makeWindow(overrides: Partial<IMaintenanceWindow> = {}): IMaintenanceWindow {
  return {
    id: "w1",
    createdBy: "admin-1",
    name: "Ventana",
    scope: [{ type: "all" }],
    mode: "scheduled",
    startAt: new Date("2026-08-01T00:00:00Z"),
    endAt: new Date("2026-08-02T00:00:00Z"),
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
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

test("UpdateMaintenanceWindowUseCase edita una ventana no cerrada", async () => {
  const window = makeWindow();
  const updated = { ...window, name: "Ventana editada" };
  const repo = makeRepo({
    findById: async () => window,
    update: async () => updated,
  });

  const useCase = new UpdateMaintenanceWindowUseCase(repo);
  const result = await useCase.execute("w1", { name: "Ventana editada" });

  assert.equal(result.name, "Ventana editada");
});

test("UpdateMaintenanceWindowUseCase lanza NotFoundError si no existe", async () => {
  const repo = makeRepo({ findById: async () => null });
  const useCase = new UpdateMaintenanceWindowUseCase(repo);
  await assert.rejects(() => useCase.execute("no-existe", {}), NotFoundError);
});

test("UpdateMaintenanceWindowUseCase lanza ValidationError si la ventana ya está cerrada", async () => {
  const repo = makeRepo({ findById: async () => makeWindow({ closedAt: new Date() }) });
  const useCase = new UpdateMaintenanceWindowUseCase(repo);
  await assert.rejects(() => useCase.execute("w1", { name: "x" }), ValidationError);
});
