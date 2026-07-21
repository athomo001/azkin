// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { EndMaintenanceWindowUseCase } from "./end-maintenance-window.usecase";
import { IMaintenanceRepository } from "../../ports/repositories/maintenance-repository";
import { IMaintenanceWindow } from "../../../domain/entities/maintenance-window";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

function makeWindow(overrides: Partial<IMaintenanceWindow> = {}): IMaintenanceWindow {
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

test("EndMaintenanceWindowUseCase cierra una ventana vigente", async () => {
  const window = makeWindow();
  const closed = { ...window, closedAt: new Date() };
  const repo = makeRepo({
    findById: async () => window,
    close: async () => closed,
  });

  const useCase = new EndMaintenanceWindowUseCase(repo);
  const result = await useCase.execute("w1");

  assert.ok(result.closedAt);
});

test("EndMaintenanceWindowUseCase lanza NotFoundError si la ventana no existe", async () => {
  const repo = makeRepo({ findById: async () => null });
  const useCase = new EndMaintenanceWindowUseCase(repo);
  await assert.rejects(() => useCase.execute("no-existe"), NotFoundError);
});

test("EndMaintenanceWindowUseCase lanza ValidationError si ya estaba cerrada", async () => {
  const repo = makeRepo({ findById: async () => makeWindow({ closedAt: new Date() }) });
  const useCase = new EndMaintenanceWindowUseCase(repo);
  await assert.rejects(() => useCase.execute("w1"), ValidationError);
});
