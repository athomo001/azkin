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
import { IAuditLogRepository } from "../../application/ports/repositories/audit-log-repository";
import { mock } from "node:test";

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

test("MultichannelNotifier no envía si el canal no está suscrito al evento", async () => {
  const channel = makeChannel({ events: ["RECOVERED"] });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAll: async () => [channel],
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

test("MultichannelNotifier registra auditoría cuando se envía un correo SMTP", async () => {
  const channel = makeChannel({
    type: "email",
    config: {
      emailRecipient: "ops@example.test",
      smtpHost: "smtp.example.test",
      smtpPort: 587,
      smtpUsername: "mailer@example.test",
      smtpPassword: "secret",
      smtpFrom: "alerts@example.test",
    },
    events: ["DOWN"],
  });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAll: async () => [channel],
    findById: async () => channel,
    update: async () => channel,
    delete: async () => true,
  };
  const { repo: auditLog, recorded } = makeAuditLog();

  const sendMail = mock.method({
    sendMail: async () => undefined,
  }, "sendMail", async () => undefined);

  const originalCreateTransport = (await import("nodemailer")).default.createTransport;
  (await import("nodemailer")).default.createTransport = (() => ({ sendMail })) as any;

  try {
    const notifier = new MultichannelNotifier(repo, auditLog);
    await notifier.notify(makeEvent({ eventType: "DOWN" }));

    assert.equal(recorded.length > 0, true, "debería registrar auditoría del correo");
    assert.equal(recorded[0].action, "NOTIFICATION_EMAIL_SENT");
    assert.equal(typeof recorded[0].metadata?.subject, "string");
    assert.ok(String(recorded[0].metadata?.subject).includes("DOWN"));
    assert.deepEqual(recorded[0].metadata?.recipients, ["ops@example.test"]);
  } finally {
    (await import("nodemailer")).default.createTransport = originalCreateTransport;
    sendMail.mock.restore();
  }
});

test("MultichannelNotifier envía cuando el evento está en la lista suscrita", async () => {
  const channel = makeChannel({ events: ["DOWN"] });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAll: async () => [channel],
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

test("MultichannelNotifier no envía un DEGRADED si el canal no está suscrito a ese evento", async () => {
  const channel = makeChannel({ events: ["DOWN"] });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAll: async () => [channel],
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
    await notifier.notify(makeEvent({
      eventType: "DEGRADED",
      from: MonitorStatus.DOWN,
      to: MonitorStatus.DEGRADED,
    }));
    assert.equal(fetchCalled, false, "no debería llamar al webhook: el canal solo está suscrito a DOWN");
  } finally {
    global.fetch = originalFetch;
  }
});

test("MultichannelNotifier envía y renderiza la plantilla cuando el canal está suscrito a DEGRADED", async () => {
  const channel = makeChannel({ events: ["DEGRADED"] });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAll: async () => [channel],
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
    await notifier.notify(makeEvent({
      eventType: "DEGRADED",
      from: MonitorStatus.DOWN,
      to: MonitorStatus.DEGRADED,
      beat: {
        monitorId: "monitor-1",
        timestamp: new Date(),
        status: MonitorStatus.DEGRADED,
        ping: 30,
        msg: "Servidor responde a nivel de red (ping) pero la aplicación no — posible degradación/sobrecarga.",
      },
    }));
    assert.ok(capturedBody, "debería haber enviado el webhook para DEGRADED");
    const parsed = JSON.parse(capturedBody!);
    assert.equal(parsed.monitor.name, "Sitio de prueba");
    assert.equal(parsed.transition.to, "DEGRADED");
  } finally {
    global.fetch = originalFetch;
  }
});

test("MultichannelNotifier (AZ-058): un nombre de monitor con comillas no rompe el JSON del webhook", async () => {
  const channel = makeChannel({ events: ["DOWN"] });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAll: async () => [channel],
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
    const event = makeEvent({ eventType: "DOWN" });
    event.monitor = { ...event.monitor, name: 'test","admin":true,"x":"y' };

    await notifier.notify(event);

    assert.ok(capturedBody, "debería haber enviado el webhook");
    // Si el body no fuera JSON válido, JSON.parse lanzaría — la aserción en sí ya prueba el fix.
    const parsed = JSON.parse(capturedBody!);
    assert.equal(parsed.monitor.name, 'test","admin":true,"x":"y');
  } finally {
    global.fetch = originalFetch;
  }
});

test("MultichannelNotifier (AZ-066): escapa caracteres especiales de Markdown en Telegram", async () => {
  const channel = makeChannel({
    type: "telegram",
    config: { botToken: "123:ABC", chatId: "chat-1" },
    events: ["DOWN"],
  });
  const repo: INotificationRepository = {
    create: async () => channel,
    findAll: async () => [channel],
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
    const event = makeEvent({ eventType: "DOWN" });
    event.monitor = { ...event.monitor, name: "[Click aquí](https://atacante.example)" };

    await notifier.notify(event);

    assert.ok(capturedBody, "debería haber enviado el mensaje de Telegram");
    const parsed = JSON.parse(capturedBody!);
    // Solo el `[` de apertura necesita escaparse para neutralizar el enlace: sin él, el parser de
    // Markdown "clásico" de Telegram no reconoce `[texto](url)` como un link.
    assert.ok(
      parsed.text.includes("\\[Click aquí](https://atacante.example)"),
      "el nombre del monitor debe llegar con el corchete de apertura escapado (sin link falso)",
    );
  } finally {
    global.fetch = originalFetch;
  }
});
