// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ImportBackupUseCase } from "./import-backup.usecase";
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { INotificationRepository, CreateNotificationData } from "../../ports/repositories/notification-repository";
import { IUserRepository, CreateUserData, CreateViewerData } from "../../ports/repositories/user-repository";
import { ITlsConfigRepository, UpsertTlsConfigData } from "../../ports/repositories/tls-config-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IMonitor } from "../../../domain/entities/monitor";
import { IUser } from "../../../domain/entities/user";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m-existing",
    userId: "admin-1",
    name: "Existing",
    type: "http",
    target: "https://existing.test",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMonitorsRepo(existing: IMonitor[] = []): IMonitorRepository {
  return {
    create: async (data) => makeMonitor({ id: `new-monitor-${Math.random()}`, name: data.name, target: data.target }),
    findAll: async () => existing,
    findById: async () => null,
    update: async (id, data) => makeMonitor({ id, name: data.name ?? "Existing", target: data.target ?? "https://existing.test" }),
    delete: async () => true,
    deleteMany: async () => 0,
    deleteAll: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
}

const scheduler: IScheduler = {
  start: async () => undefined,
  schedule: () => undefined,
  reschedule: () => undefined,
  unschedule: () => undefined,
  stopAll: () => undefined,
  receivePushHeartbeat: async () => undefined,
};

const auditLog: IAuditLogRepository = {
  record: async (data) => ({ id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data }),
  listRecent: async () => [],
  listAll: async () => [],
  deleteAll: async () => 0,
};

function makeUsersRepo(seedAdmins: IUser[] = [], seedViewers: IUser[] = []) {
  const admins = [...seedAdmins];
  const viewers = [...seedViewers];
  let seq = 0;
  const repo: IUserRepository = {
    create: async (data: CreateUserData) => {
      const user: IUser = {
        id: `admin-new-${++seq}`,
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        role: "admin",
        permissions: [],
        preferences: { nyanCatMode: false },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      admins.push(user);
      return user;
    },
    findByEmail: async (email) => admins.find((a) => a.email === email) ?? null,
    findByIdentifier: async () => null,
    findById: async () => null,
    changePassword: async (id, hash) => {
      const a = admins.find((x) => x.id === id);
      if (a) a.passwordHash = hash;
      return !!a;
    },
    countAdmins: async () => admins.length,
    findAllAdmins: async () => admins,
    findAllViewersGlobal: async () => viewers,
    updateAdminEmail: async () => null,
    setAdminBlocked: async (id, isBlocked) => {
      const a = admins.find((x) => x.id === id);
      if (a) a.isBlocked = isBlocked;
      return a ?? null;
    },
    deleteAdmin: async () => true,
    setPasswordResetToken: async () => undefined,
    findByValidResetTokenHash: async () => null,
    clearPasswordResetToken: async () => undefined,
    createViewer: async (data: CreateViewerData) => {
      const user: IUser = {
        id: `viewer-new-${++seq}`,
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        role: "viewer",
        adminId: data.adminId,
        permissions: data.permissions,
        isTvSessionEnabled: data.isTvSessionEnabled,
        preferences: { nyanCatMode: false },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      viewers.push(user);
      return user;
    },
    findAllViewers: async (adminId) => viewers.filter((v) => v.adminId === adminId),
    findViewerById: async () => null,
    updateViewerPermissions: async (adminId, id, data) => {
      const v = viewers.find((x) => x.id === id && x.adminId === adminId);
      if (!v) return null;
      v.permissions = data.permissions ?? v.permissions;
      if (data.isTvSessionEnabled !== undefined) v.isTvSessionEnabled = data.isTvSessionEnabled;
      return v;
    },
    deleteViewer: async () => true,
    updatePreferences: async (userId, prefs) => {
      const u = admins.find((x) => x.id === userId) ?? viewers.find((x) => x.id === userId);
      if (u) u.preferences = prefs;
    },
    deleteAllUsersExcept: async () => ({ deletedAdmins: 0, deletedViewers: 0 }),
  };
  return { repo, admins, viewers };
}

function makeNotificationsRepo() {
  const created: CreateNotificationData[] = [];
  const existing: { id: string; name: string }[] = [];
  let seq = 0;
  const repo: INotificationRepository = {
    create: async (data) => {
      created.push(data);
      const n = { id: `notif-${++seq}`, name: data.name };
      existing.push(n);
      return {
        id: n.id,
        userId: data.userId,
        name: data.name,
        type: data.type,
        config: data.config,
        isActive: data.isActive ?? true,
        events: data.events ?? "all",
        templates: data.templates ?? {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    findAll: async () =>
      existing.map((e) => ({
        id: e.id,
        userId: "admin-1",
        name: e.name,
        type: "email" as const,
        config: {},
        isActive: true,
        events: "all" as const,
        templates: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    deleteAll: async () => 0,
  };
  return { repo, created };
}

function makeTlsConfigsRepo() {
  const upserts: UpsertTlsConfigData[] = [];
  const repo: ITlsConfigRepository = {
    getActive: async () => null,
    upsert: async (data) => {
      upserts.push(data);
      return { id: "tls-1", ...data, updatedAt: new Date() };
    },
    deleteActive: async () => false,
  };
  return { repo, upserts };
}

test("ImportBackupUseCase restaura admins, viewers (resolviendo adminIdentifier), canales, TLS y monitores desde un respaldo completo v2.0", async () => {
  const { repo: users, admins, viewers } = makeUsersRepo();
  const { repo: notifications, created: createdNotifications } = makeNotificationsRepo();
  const { repo: tlsConfigs, upserts } = makeTlsConfigsRepo();
  const monitors = makeMonitorsRepo([]);

  const useCase = new ImportBackupUseCase(monitors, scheduler, notifications, users, tlsConfigs, auditLog);

  const result = await useCase.execute({
    userId: "importer-1",
    monitors: [{ name: "FOSS", type: "http", target: "https://foss.test", interval: 60, retries: 0, retryInterval: 60, group: null, tags: [], notificationIds: [] } as Omit<CreateMonitorData, "userId" | "pushToken">],
    admins: [{ email: "admin@azkin.test", username: "admin", passwordHash: "hash-admin" }],
    viewers: [
      {
        email: "viewer@azkin.test",
        passwordHash: "hash-viewer",
        adminIdentifier: "admin@azkin.test",
        permissions: [{ type: "all" }],
      },
    ],
    notifications: [{ name: "Canal Email", type: "email", config: { email: "alerta@azkin.test" } }],
    tlsConfig: { certPem: "CERT", keyPemEncrypted: "ENC", port: 8443, httpRedirect: true },
  });

  assert.equal(result.admins.createdCount, 1);
  assert.equal(result.admins.errors.length, 0);
  assert.equal(admins[0].email, "admin@azkin.test");

  assert.equal(result.viewers.createdCount, 1);
  assert.equal(result.viewers.errors.length, 0);
  assert.equal(viewers[0].adminId, admins[0].id);

  assert.equal(result.notifications.createdCount, 1);
  assert.equal(createdNotifications[0].name, "Canal Email");

  assert.equal(result.tlsConfig.applied, true);
  assert.equal(upserts[0].certPem, "CERT");

  assert.equal(result.importedCount, 1);
});

test("ImportBackupUseCase acumula un error por viewer cuyo adminIdentifier no corresponde a ningún admin importado ni existente", async () => {
  const { repo: users } = makeUsersRepo();
  const { repo: notifications } = makeNotificationsRepo();
  const { repo: tlsConfigs } = makeTlsConfigsRepo();
  const monitors = makeMonitorsRepo([]);

  const useCase = new ImportBackupUseCase(monitors, scheduler, notifications, users, tlsConfigs, auditLog);

  const result = await useCase.execute({
    userId: "importer-1",
    monitors: [],
    viewers: [
      {
        email: "huerfano@azkin.test",
        passwordHash: "hash",
        adminIdentifier: "no-existe@azkin.test",
        permissions: [],
      },
    ],
  });

  assert.equal(result.viewers.createdCount, 0);
  assert.equal(result.viewers.errors.length, 1);
  assert.equal(result.viewers.errors[0].index, 0);
});

test("ImportBackupUseCase actualiza (no duplica) un admin existente con el mismo email, y respalda su nuevo passwordHash", async () => {
  const existingAdmin: IUser = {
    id: "admin-1",
    email: "admin@azkin.test",
    passwordHash: "hash-viejo",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { repo: users, admins } = makeUsersRepo([existingAdmin]);
  const { repo: notifications } = makeNotificationsRepo();
  const { repo: tlsConfigs } = makeTlsConfigsRepo();
  const monitors = makeMonitorsRepo([]);

  const useCase = new ImportBackupUseCase(monitors, scheduler, notifications, users, tlsConfigs, auditLog);

  const result = await useCase.execute({
    userId: "importer-1",
    monitors: [],
    admins: [{ email: "admin@azkin.test", passwordHash: "hash-nuevo" }],
  });

  assert.equal(result.admins.createdCount, 0);
  assert.equal(result.admins.updatedCount, 1);
  assert.equal(admins.length, 1);
  assert.equal(admins[0].passwordHash, "hash-nuevo");
});

test("ImportBackupUseCase acepta un respaldo v1.0 (solo monitors, sin las demás secciones) sin fallar", async () => {
  const { repo: users } = makeUsersRepo();
  const { repo: notifications } = makeNotificationsRepo();
  const { repo: tlsConfigs } = makeTlsConfigsRepo();
  const monitors = makeMonitorsRepo([]);

  const useCase = new ImportBackupUseCase(monitors, scheduler, notifications, users, tlsConfigs, auditLog);

  const result = await useCase.execute({
    userId: "importer-1",
    monitors: [{ name: "Sitio Viejo", type: "http", target: "https://viejo.test", interval: 60, retries: 0, retryInterval: 60, group: null, tags: [], notificationIds: [] } as Omit<CreateMonitorData, "userId" | "pushToken">],
  });

  assert.equal(result.importedCount, 1);
  assert.equal(result.admins.createdCount, 0);
  assert.equal(result.admins.errors.length, 0);
  assert.equal(result.viewers.createdCount, 0);
  assert.equal(result.notifications.createdCount, 0);
  assert.equal(result.tlsConfig.applied, false);
  assert.match(result.tlsConfig.skippedReason ?? "", /v1\.0/);
});
