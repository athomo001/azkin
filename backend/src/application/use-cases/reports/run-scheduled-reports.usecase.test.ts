// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RunScheduledReportsUseCase } from "./run-scheduled-reports.usecase";
import { SendReportEmailUseCase } from "./send-report-email.usecase";
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { IReportDefinition } from "../../../domain/entities/report-definition";

function makeDefinition(overrides: Partial<IReportDefinition> = {}): IReportDefinition {
  return {
    id: "r1",
    name: "Diario — Comercial",
    enabled: true,
    frequency: "daily",
    scope: [{ type: "all" }],
    hour: 8,
    recipientMode: "default_alert_email",
    recipientEmails: [],
    lastSentAt: null,
    createdBy: "admin-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(definitions: IReportDefinition[]): IReportDefinitionRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => definitions,
    findEnabled: async () => definitions.filter((d) => d.enabled),
    findById: async () => null,
    update: async () => null,
    delete: async () => false,
    markSent: async () => undefined,
  };
}

// SendReportEmailUseCase se usa solo como "shape" — sustituimos `execute` a mano en cada test en
// vez de instanciar sus dependencias reales.
function makeSender(execute: SendReportEmailUseCase["execute"]): SendReportEmailUseCase {
  return { execute } as unknown as SendReportEmailUseCase;
}

test("RunScheduledReportsUseCase envia una definicion diaria cuya hora coincide", async () => {
  const now = new Date(2026, 6, 21, 8, 5); // 21 jul 2026, 08:05 hora local
  const definition = makeDefinition({ hour: 8 });
  const repo = makeRepo([definition]);

  const sentIds: string[] = [];
  const sender = makeSender(async (def) => {
    sentIds.push(def.id);
  });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  const results = await useCase.execute(now);

  assert.deepEqual(sentIds, ["r1"]);
  assert.equal(results[0]?.success, true);
});

test("RunScheduledReportsUseCase no envia si la hora no coincide", async () => {
  const now = new Date(2026, 6, 21, 9, 0);
  const definition = makeDefinition({ hour: 8 });
  const repo = makeRepo([definition]);
  const sender = makeSender(async () => { throw new Error("no debería llamarse"); });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  const results = await useCase.execute(now);

  assert.deepEqual(results, []);
});

test("RunScheduledReportsUseCase no envia fuera de la ventana de 15 minutos", async () => {
  const now = new Date(2026, 6, 21, 8, 20);
  const definition = makeDefinition({ hour: 8 });
  const repo = makeRepo([definition]);
  const sender = makeSender(async () => { throw new Error("no debería llamarse"); });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  const results = await useCase.execute(now);

  assert.deepEqual(results, []);
});

test("RunScheduledReportsUseCase respeta dayOfWeek para informes semanales", async () => {
  // 21 jul 2026 es martes (getDay() === 2)
  const now = new Date(2026, 6, 21, 8, 5);
  const wrongDay = makeDefinition({ id: "r-wrong-day", frequency: "weekly", hour: 8, dayOfWeek: 1 });
  const rightDay = makeDefinition({ id: "r-right-day", frequency: "weekly", hour: 8, dayOfWeek: 2 });
  const repo = makeRepo([wrongDay, rightDay]);

  const sentIds: string[] = [];
  const sender = makeSender(async (def) => {
    sentIds.push(def.id);
  });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  await useCase.execute(now);

  assert.deepEqual(sentIds, ["r-right-day"]);
});

test("RunScheduledReportsUseCase evita doble envio diario si ya se envio hace menos de 20h", async () => {
  const now = new Date(2026, 6, 21, 8, 5);
  const definition = makeDefinition({ hour: 8, lastSentAt: new Date(now.getTime() - 60 * 60 * 1000) }); // hace 1h
  const repo = makeRepo([definition]);
  const sender = makeSender(async () => { throw new Error("no debería llamarse"); });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  const results = await useCase.execute(now);

  assert.deepEqual(results, []);
});

test("RunScheduledReportsUseCase permite reenvio diario si ya paso mas de 20h", async () => {
  const now = new Date(2026, 6, 21, 8, 5);
  const definition = makeDefinition({ hour: 8, lastSentAt: new Date(now.getTime() - 25 * 60 * 60 * 1000) }); // hace 25h
  const repo = makeRepo([definition]);

  const sentIds: string[] = [];
  const sender = makeSender(async (def) => {
    sentIds.push(def.id);
  });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  await useCase.execute(now);

  assert.deepEqual(sentIds, ["r1"]);
});

test("RunScheduledReportsUseCase no detiene el resto si una definicion falla", async () => {
  const now = new Date(2026, 6, 21, 8, 5);
  const failing = makeDefinition({ id: "r-fail", hour: 8 });
  const ok = makeDefinition({ id: "r-ok", hour: 8 });
  const repo = makeRepo([failing, ok]);

  const sentIds: string[] = [];
  const sender = makeSender(async (def) => {
    if (def.id === "r-fail") throw new Error("SMTP caído");
    sentIds.push(def.id);
  });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  const results = await useCase.execute(now);

  assert.deepEqual(sentIds, ["r-ok"]);
  assert.equal(results.find((r) => r.definitionId === "r-fail")?.success, false);
  assert.equal(results.find((r) => r.definitionId === "r-ok")?.success, true);
});

test("RunScheduledReportsUseCase ignora definiciones deshabilitadas", async () => {
  const now = new Date(2026, 6, 21, 8, 5);
  const disabled = makeDefinition({ hour: 8, enabled: false });
  const repo = makeRepo([disabled]);
  const sender = makeSender(async () => { throw new Error("no debería llamarse"); });

  const useCase = new RunScheduledReportsUseCase(repo, sender);
  const results = await useCase.execute(now);

  assert.deepEqual(results, []);
});
