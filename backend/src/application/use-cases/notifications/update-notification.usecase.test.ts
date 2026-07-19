// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { UpdateNotificationUseCase } from "./update-notification.usecase";
import { INotificationRepository, UpdateNotificationData } from "../../ports/repositories/notification-repository";
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

test("UpdateNotificationUseCase conserva el webhookUrl real si llega enmascarado (sin cambios desde el form)", async () => {
  const realWebhook = "https://hooks.slack.com/services/T000/B000/SECRET1234";
  const existing = makeNotification({ webhookUrl: realWebhook });
  const repo = makeRepo(existing);
  const useCase = new UpdateNotificationUseCase(repo);

  const maskedIncoming = maskSecret(realWebhook);
  const updated = await useCase.execute("n1", { config: { webhookUrl: maskedIncoming } });

  assert.equal(updated.config.webhookUrl, realWebhook);
});

test("UpdateNotificationUseCase reemplaza el webhookUrl si el admin ingresa un valor nuevo real", async () => {
  const existing = makeNotification({ webhookUrl: "https://hooks.slack.com/services/OLD" });
  const repo = makeRepo(existing);
  const useCase = new UpdateNotificationUseCase(repo);

  const newWebhook = "https://hooks.slack.com/services/NEW";
  const updated = await useCase.execute("n1", { config: { webhookUrl: newWebhook } });

  assert.equal(updated.config.webhookUrl, newWebhook);
});
