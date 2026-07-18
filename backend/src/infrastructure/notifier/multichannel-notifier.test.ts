// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { MultichannelNotifier } from "./multichannel-notifier";
import { INotificationRepository } from "../../application/ports/repositories/notification-repository";
import { INotification } from "../../domain/entities/notification";
import { NotificationEvent } from "../../application/ports/services/notifier";
import { MonitorStatus } from "../../domain/value-objects/monitor-status";
import { IMonitor } from "../../domain/entities/monitor";
import { IHeartbeat } from "../../domain/entities/heartbeat";

function makeChannel(overrides: Partial<INotification>): INotification {
  return {
    id: "notif-1",
    userId: "admin-1",
    name: "Webhook de prueba",
    type: "webhook",
    config: { webhookUrl: "https://example.test/hook" },
    isActive: true,
    events: "all",
    templates: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeEvent(overrides: Partial<NotificationEvent>): NotificationEvent {
  const monitor: IMonitor = {
    id: "monitor-1",
    userId: "admin-1",
    name: "Sitio de prueba",
    type: "http",
    target: "https://example.test",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: ["notif-1"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const beat: IHeartbeat = {
    monitorId: "monitor-1",
    timestamp: new Date(),
    status: MonitorStatus.DOWN,
    ping: null,
    msg: "timeout",
  };
  return {
    notificationId: "notif-1",
    eventType: "DOWN",
    monitor,
    from: MonitorStatus.UP,
    to: MonitorStatus.DOWN,
    beat,
    ...overrides,
  };
}

test("MultichannelNotifier no envía si el canal no está suscrito al evento (AZ-007)", async () => {
  const channel = makeChannel({ events: ["RECOVERED"] });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAllByUser: async () => [channel],
    findById: async () => channel,
    update: async () => channel,
    delete: async () => true,
  };

  let fetchCalled = false;
  const originalFetch = global.fetch;
  global.fetch = (async () => {
    fetchCalled = true;
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  try {
    const notifier = new MultichannelNotifier(repo);
    await notifier.notify(makeEvent({ eventType: "DOWN" }));
    assert.equal(fetchCalled, false, "no debería llamar al webhook para un evento no suscrito");
  } finally {
    global.fetch = originalFetch;
  }
});

test("MultichannelNotifier envía cuando el evento está en la lista suscrita", async () => {
  const channel = makeChannel({ events: ["DOWN"] });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAllByUser: async () => [channel],
    findById: async () => channel,
    update: async () => channel,
    delete: async () => true,
  };

  let capturedBody: string | undefined;
  const originalFetch = global.fetch;
  global.fetch = (async (_url: string, init?: RequestInit) => {
    capturedBody = init?.body as string;
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  try {
    const notifier = new MultichannelNotifier(repo);
    await notifier.notify(makeEvent({ eventType: "DOWN" }));
    assert.ok(capturedBody, "debería haber enviado el webhook");
    const parsed = JSON.parse(capturedBody!);
    assert.equal(parsed.monitor.name, "Sitio de prueba");
  } finally {
    global.fetch = originalFetch;
  }
});
