// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { UpdateReportDefinitionUseCase } from "./update-report-definition.usecase";
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IReportDefinition } from "../../../domain/entities/report-definition";
import { NotFoundError } from "../../../domain/errors/domain-error";

const auditLog: IAuditLogRepository = {
  record: async (data) => ({ id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data }),
  listRecent: async () => [],
  listAll: async () => [],
  deleteAll: async () => 0,
};

function makeDefinition(overrides: Partial<IReportDefinition> = {}): IReportDefinition {
  return {
    id: "r1",
    name: "Diario — Comercial",
    enabled: true,
    frequency: "daily",
    scope: [{ type: "group", value: "Comercial" }],
    hour: 8,
    recipientMode: "custom_list",
    recipientEmails: ["comercial@empresa.com"],
    lastSentAt: null,
    createdBy: "admin-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<IReportDefinitionRepository> = {}): IReportDefinitionRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findEnabled: async () => [],
    findById: async () => null,
    update: async () => null,
    delete: async () => false,
    markSent: async () => undefined,
    ...overrides,
  };
}

test("UpdateReportDefinitionUseCase edita una definicion existente", async () => {
  const definition = makeDefinition();
  const updated = { ...definition, name: "Diario — Comercial (editado)" };
  const repo = makeRepo({
    findById: async () => definition,
    update: async () => updated,
  });

  const useCase = new UpdateReportDefinitionUseCase(repo, auditLog);
  const result = await useCase.execute("admin-1", "r1", { name: "Diario — Comercial (editado)" });

  assert.equal(result.name, "Diario — Comercial (editado)");
});

test("UpdateReportDefinitionUseCase lanza NotFoundError si no existe", async () => {
  const repo = makeRepo({ findById: async () => null });
  const useCase = new UpdateReportDefinitionUseCase(repo, auditLog);
  await assert.rejects(() => useCase.execute("admin-1", "no-existe", {}), NotFoundError);
});
