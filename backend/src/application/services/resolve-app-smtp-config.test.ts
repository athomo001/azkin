// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ResolveAppSmtpConfig } from "./resolve-app-smtp-config";
import { IAppSmtpSettingsRepository } from "../ports/repositories/app-smtp-settings-repository";
import { INotificationRepository } from "../ports/repositories/notification-repository";
import { IAppSmtpSettings } from "../../domain/entities/app-smtp-settings";
import { INotification } from "../../domain/entities/notification";

const envSmtpConfig = { host: "smtp.env.test", port: 25, secure: false, user: "env-user", password: "env-pass", from: "env@azkin.test" };

function makeSettingsRepo(active: IAppSmtpSettings | null): IAppSmtpSettingsRepository {
  return {
    getActive: async () => active,
    upsert: async () => { throw new Error("not implemented"); },
  };
}

function makeNotificationsRepo(channel: INotification | null): INotificationRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findById: async (id) => (channel && channel.id === id ? channel : null),
    update: async () => null,
    delete: async () => true,
    deleteAll: async () => 0,
  };
}

function makeEmailChannel(overrides: Partial<INotification> = {}): INotification {
  return {
    id: "channel-1",
    userId: "admin-1",
    name: "Canal Email",
    type: "email",
    config: {
      email: "alerta@azkin.test",
      smtpHost: "smtp.channel.test",
      smtpPort: 465,
      smtpUsername: "channel-user",
      smtpPassword: "channel-pass",
      smtpSecure: true,
      smtpFrom: "channel@azkin.test",
    },
    isActive: true,
    events: "all",
    templates: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

test("ResolveAppSmtpConfig usa las variables de entorno si no hay ningún canal seleccionado", async () => {
  const resolver = new ResolveAppSmtpConfig(makeSettingsRepo(null), makeNotificationsRepo(null), envSmtpConfig);
  const result = await resolver.resolve();
  assert.deepEqual(result, envSmtpConfig);
});

test("ResolveAppSmtpConfig reutiliza el SMTP del canal de email seleccionado", async () => {
  const channel = makeEmailChannel();
  const settings: IAppSmtpSettings = { id: "s1", notificationChannelId: "channel-1", updatedAt: new Date(), updatedById: "admin-1" };
  const resolver = new ResolveAppSmtpConfig(makeSettingsRepo(settings), makeNotificationsRepo(channel), envSmtpConfig);

  const result = await resolver.resolve();

  assert.equal(result.host, "smtp.channel.test");
  assert.equal(result.port, 465);
  assert.equal(result.secure, true);
  assert.equal(result.user, "channel-user");
  assert.equal(result.password, "channel-pass");
  assert.equal(result.from, "channel@azkin.test");
});

test("ResolveAppSmtpConfig cae a las variables de entorno si el canal seleccionado ya no existe", async () => {
  const settings: IAppSmtpSettings = { id: "s1", notificationChannelId: "channel-borrado", updatedAt: new Date(), updatedById: "admin-1" };
  const resolver = new ResolveAppSmtpConfig(makeSettingsRepo(settings), makeNotificationsRepo(null), envSmtpConfig);

  const result = await resolver.resolve();

  assert.deepEqual(result, envSmtpConfig);
});

test("ResolveAppSmtpConfig cae a las variables de entorno si el canal seleccionado cambió a un tipo distinto de email", async () => {
  const channel = makeEmailChannel({ id: "channel-1", type: "slack", config: { webhookUrl: "https://hooks.slack.test/x" } });
  const settings: IAppSmtpSettings = { id: "s1", notificationChannelId: "channel-1", updatedAt: new Date(), updatedById: "admin-1" };
  const resolver = new ResolveAppSmtpConfig(makeSettingsRepo(settings), makeNotificationsRepo(channel), envSmtpConfig);

  const result = await resolver.resolve();

  assert.deepEqual(result, envSmtpConfig);
});
