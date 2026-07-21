// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { UpdateNotificationUseCase } from "./update-notification.usecase";
import { INotificationRepository, UpdateNotificationData } from "../../ports/repositories/notification-repository";
import { IAuditLogRepository, RecordAuditLogData } from "../../ports/repositories/audit-log-repository";
import { INotification } from "../../../domain/entities/notification";
import { maskSecret } from "../../services/notification-secrets";

function makeNotification(config: Record<string, unknown>): INotification {
  return {
    id: "n1",
    userId: "admin-1",
    name: "Slack Ops",
    type: "slack",
    config,
    isActive: true,
    events: "all",
    templates: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeRepo(existing: INotification): INotificationRepository & { updatedWith: UpdateNotificationData | null } {
  const state = { updatedWith: null as UpdateNotificationData | null };
  return {
    updatedWith: state.updatedWith,
    create: async () => existing,
    findAll: async () => [existing],
    findById: async () => existing,
    update: async (_id, data) => {
      state.updatedWith = data;
      const mergedConfig = data.config ? { ...existing.config, ...data.config } : existing.config;
      return { ...existing, ...data, config: mergedConfig };
    },
    delete: async () => true,
  };
}

function makeAuditLogSpy(): { auditLog: IAuditLogRepository; calls: RecordAuditLogData[] } {
  const calls: RecordAuditLogData[] = [];
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      calls.push(data);
      return { id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { auditLog, calls };
}

test("UpdateNotificationUseCase conserva el webhookUrl real si llega enmascarado (sin cambios desde el form)", async () => {
  const realWebhook = "https://hooks.slack.com/services/T000/B000/SECRET1234";
  const existing = makeNotification({ webhookUrl: realWebhook });
  const repo = makeRepo(existing);
  const { auditLog } = makeAuditLogSpy();
  const useCase = new UpdateNotificationUseCase(repo, auditLog);

  const maskedIncoming = maskSecret(realWebhook);
  const updated = await useCase.execute("admin-1", "n1", { config: { webhookUrl: maskedIncoming } });

  assert.equal(updated.config.webhookUrl, realWebhook);
});

test("UpdateNotificationUseCase reemplaza el webhookUrl si el admin ingresa un valor nuevo real", async () => {
  const existing = makeNotification({ webhookUrl: "https://hooks.slack.com/services/OLD" });
  const repo = makeRepo(existing);
  const { auditLog } = makeAuditLogSpy();
  const useCase = new UpdateNotificationUseCase(repo, auditLog);

  const newWebhook = "https://hooks.slack.com/services/NEW";
  const updated = await useCase.execute("admin-1", "n1", { config: { webhookUrl: newWebhook } });

  assert.equal(updated.config.webhookUrl, newWebhook);
});

test("UpdateNotificationUseCase nunca guarda el webhookUrl en texto plano en el historial de auditoría", async () => {
  const existing = makeNotification({ webhookUrl: "https://hooks.slack.com/services/OLD/SECRETOLD1" });
  const repo = makeRepo(existing);
  const { auditLog, calls } = makeAuditLogSpy();
  const useCase = new UpdateNotificationUseCase(repo, auditLog);

  const newWebhook = "https://hooks.slack.com/services/NEW/SECRETNEW2";
  await useCase.execute("admin-1", "n1", { config: { webhookUrl: newWebhook } });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "NOTIFICATION_UPDATE");
  const changes = calls[0].metadata?.changes as Record<string, { from: unknown; to: unknown }>;
  const configChange = changes.config as unknown as { from: Record<string, unknown>; to: Record<string, unknown> };
  assert.ok(configChange, "config debe aparecer en el diff ya que el secreto efectivamente cambió");
  assert.ok(!JSON.stringify(configChange).includes("SECRETOLD1"), "el secreto anterior no debe aparecer en texto plano en el diff de auditoría");
  assert.ok(!JSON.stringify(configChange).includes("SECRETNEW2"), "el secreto nuevo no debe aparecer en texto plano en el diff de auditoría");
});
