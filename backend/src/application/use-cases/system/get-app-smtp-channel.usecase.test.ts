// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GetAppSmtpChannelUseCase } from "./get-app-smtp-channel.usecase";
import { IAppSmtpSettingsRepository } from "../../ports/repositories/app-smtp-settings-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IAppSmtpSettings } from "../../../domain/entities/app-smtp-settings";
import { INotification } from "../../../domain/entities/notification";

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

test("GetAppSmtpChannelUseCase devuelve null si no hay ningún canal seleccionado", async () => {
  const useCase = new GetAppSmtpChannelUseCase(makeSettingsRepo(null), makeNotificationsRepo(null));
  const result = await useCase.execute();
  assert.deepEqual(result, { notificationChannelId: null, channelName: null });
});

test("GetAppSmtpChannelUseCase devuelve el id y nombre del canal seleccionado", async () => {
  const channel: INotification = {
    id: "channel-1",
    userId: "admin-1",
    name: "Canal Email Principal",
    type: "email",
    config: {},
    isActive: true,
    events: "all",
    templates: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const settings: IAppSmtpSettings = { id: "s1", notificationChannelId: "channel-1", updatedAt: new Date(), updatedById: "admin-1" };
  const useCase = new GetAppSmtpChannelUseCase(makeSettingsRepo(settings), makeNotificationsRepo(channel));

  const result = await useCase.execute();

  assert.equal(result.notificationChannelId, "channel-1");
  assert.equal(result.channelName, "Canal Email Principal");
});
