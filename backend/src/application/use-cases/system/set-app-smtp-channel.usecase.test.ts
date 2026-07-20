// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { SetAppSmtpChannelUseCase } from "./set-app-smtp-channel.usecase";
import { IAppSmtpSettingsRepository, UpsertAppSmtpSettingsData } from "../../ports/repositories/app-smtp-settings-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { INotification } from "../../../domain/entities/notification";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

function makeSettingsRepo() {
  const upserts: UpsertAppSmtpSettingsData[] = [];
  const repo: IAppSmtpSettingsRepository = {
    getActive: async () => null,
    upsert: async (data) => {
      upserts.push(data);
      return { id: "s1", notificationChannelId: data.notificationChannelId, updatedAt: new Date(), updatedById: data.updatedById };
    },
  };
  return { repo, upserts };
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

function makeAuditLog() {
  const recorded: any[] = [];
  const repo: IAuditLogRepository = {
    record: async (data) => {
      recorded.push(data);
      return { id: "audit-1", createdAt: new Date(), ...data };
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { repo, recorded };
}

function makeEmailChannel(): INotification {
  return {
    id: "channel-1",
    userId: "admin-1",
    name: "Canal Email",
    type: "email",
    config: {},
    isActive: true,
    events: "all",
    templates: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

test("SetAppSmtpChannelUseCase persiste el canal elegido y registra auditoría", async () => {
  const { repo: settings, upserts } = makeSettingsRepo();
  const { repo: auditLog, recorded } = makeAuditLog();
  const useCase = new SetAppSmtpChannelUseCase(settings, makeNotificationsRepo(makeEmailChannel()), auditLog);

  await useCase.execute("admin-1", "channel-1");

  assert.equal(upserts[0].notificationChannelId, "channel-1");
  assert.equal(recorded[0].action, "APP_SMTP_CHANNEL_SET");
});

test("SetAppSmtpChannelUseCase permite revertir a null (variables de entorno)", async () => {
  const { repo: settings, upserts } = makeSettingsRepo();
  const { repo: auditLog } = makeAuditLog();
  const useCase = new SetAppSmtpChannelUseCase(settings, makeNotificationsRepo(null), auditLog);

  await useCase.execute("admin-1", null);

  assert.equal(upserts[0].notificationChannelId, null);
});

test("SetAppSmtpChannelUseCase rechaza un canal que no existe", async () => {
  const { repo: settings } = makeSettingsRepo();
  const { repo: auditLog } = makeAuditLog();
  const useCase = new SetAppSmtpChannelUseCase(settings, makeNotificationsRepo(null), auditLog);

  await assert.rejects(() => useCase.execute("admin-1", "no-existe"), NotFoundError);
});

test("SetAppSmtpChannelUseCase rechaza un canal que no es de tipo email", async () => {
  const slackChannel: INotification = { ...makeEmailChannel(), type: "slack" };
  const { repo: settings } = makeSettingsRepo();
  const { repo: auditLog } = makeAuditLog();
  const useCase = new SetAppSmtpChannelUseCase(settings, makeNotificationsRepo(slackChannel), auditLog);

  await assert.rejects(() => useCase.execute("admin-1", "channel-1"), ValidationError);
});
