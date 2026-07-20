// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { CreateBackupUseCase } from "./create-backup.usecase";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { IMonitor } from "../../../domain/entities/monitor";
import { INotification } from "../../../domain/entities/notification";
import { IUser } from "../../../domain/entities/user";
import { ITlsConfig } from "../../../domain/entities/tls-config";
import { IBackup } from "../../../domain/entities/backup";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m-1",
    userId: "admin-1",
    name: "Sitio",
    type: "http",
    target: "https://sitio.test",
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

function makeAdmin(overrides: Partial<IUser> = {}): IUser {
  return {
    id: "admin-1",
    email: "admin@azkin.test",
    username: "admin",
    passwordHash: "hash-admin",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeViewer(overrides: Partial<IUser> = {}): IUser {
  return {
    id: "viewer-1",
    email: "viewer@azkin.test",
    passwordHash: "hash-viewer",
    role: "viewer",
    adminId: "admin-1",
    permissions: [{ type: "all" }],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeNotification(overrides: Partial<INotification> = {}): INotification {
  return {
    id: "n-1",
    userId: "admin-1",
    name: "Canal Email",
    type: "email",
    config: { email: "alerta@azkin.test" },
    isActive: true,
    events: "all",
    templates: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const noopMonitors: IMonitorRepository = {
  create: async () => { throw new Error("not implemented"); },
  findAll: async () => [],
  findById: async () => null,
  update: async () => null,
  delete: async () => true,
  deleteMany: async () => 0,
  deleteAll: async () => 0,
  findAllActive: async () => [],
  distinctTags: async () => [],
};

const noopUsers: IUserRepository = {
  create: async () => { throw new Error("not implemented"); },
  findByEmail: async () => null,
  findByIdentifier: async () => null,
  findById: async () => null,
  changePassword: async () => true,
  countAdmins: async () => 1,
  findAllAdmins: async () => [],
  findAllViewersGlobal: async () => [],
  updateAdminEmail: async () => null,
  setAdminBlocked: async () => null,
  deleteAdmin: async () => true,
  setPasswordResetToken: async () => undefined,
  findByValidResetTokenHash: async () => null,
  clearPasswordResetToken: async () => undefined,
  createViewer: async () => { throw new Error("not implemented"); },
  findAllViewers: async () => [],
  findViewerById: async () => null,
  updateViewerPermissions: async () => null,
  deleteViewer: async () => true,
  updatePreferences: async () => undefined,
  deleteAllUsersExcept: async () => ({ deletedAdmins: 0, deletedViewers: 0 }),
};

const noopNotifications: INotificationRepository = {
  create: async () => { throw new Error("not implemented"); },
  findAll: async () => [],
  findById: async () => null,
  update: async () => null,
  delete: async () => true,
  deleteAll: async () => 0,
};

const noopTlsConfigs: ITlsConfigRepository = {
  getActive: async () => null,
  upsert: async () => { throw new Error("not implemented"); },
  deleteActive: async () => false,
};

function makeBackupsRepo(overrides: Partial<IBackupRepository> = {}) {
  const created: { userId: string; strategy: string; payload: unknown }[] = [];
  const repo: IBackupRepository = {
    create: async (data) => {
      created.push(data);
      return { id: "backup-1", userId: data.userId, strategy: data.strategy, payload: data.payload, createdAt: new Date() } as IBackup;
    },
    findAll: async () => [],
    findById: async () => null,
    deleteAll: async () => 0,
    ...overrides,
  };
  return { repo, created };
}

const noopAuditLog: IAuditLogRepository = {
  record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
  listRecent: async () => [],
  listAll: async () => [],
  deleteAll: async () => 0,
};

test("CreateBackupUseCase incluye monitores, canales, admins/viewers y config TLS en el mismo respaldo (atómico)", async () => {
  const monitors: IMonitorRepository = { ...noopMonitors, findAll: async () => [makeMonitor()] };
  const notifications: INotificationRepository = { ...noopNotifications, findAll: async () => [makeNotification()] };
  const users: IUserRepository = {
    ...noopUsers,
    findAllAdmins: async () => [makeAdmin()],
    findAllViewersGlobal: async () => [makeViewer()],
  };
  const tlsConfig: ITlsConfig = {
    id: "tls-1",
    certPem: "CERT",
    keyPemEncrypted: "ENCRYPTED_KEY",
    port: 8443,
    httpRedirect: true,
    updatedAt: new Date(),
    updatedById: "admin-1",
  };
  const tlsConfigs: ITlsConfigRepository = { ...noopTlsConfigs, getActive: async () => tlsConfig };
  const { repo: backups, created } = makeBackupsRepo();

  const useCase = new CreateBackupUseCase(monitors, backups, noopAuditLog, notifications, users, tlsConfigs);
  await useCase.execute({ userId: "admin-1", strategy: "accumulate" });

  assert.equal(created.length, 1);
  const payload = created[0].payload as any;
  assert.equal(payload.version, "2.0");
  assert.equal(payload.monitors.length, 1);
  assert.equal(payload.monitors[0].name, "Sitio");
  assert.equal(payload.notifications.length, 1);
  assert.equal(payload.notifications[0].name, "Canal Email");
  assert.equal(payload.admins.length, 1);
  assert.equal(payload.admins[0].email, "admin@azkin.test");
  assert.equal(payload.admins[0].passwordHash, "hash-admin");
  assert.equal(payload.viewers.length, 1);
  assert.equal(payload.viewers[0].email, "viewer@azkin.test");
  assert.equal(payload.viewers[0].adminIdentifier, "admin@azkin.test");
  assert.equal(payload.tlsConfig.certPem, "CERT");
  assert.equal(payload.tlsConfig.keyPemEncrypted, "ENCRYPTED_KEY");
});

test("CreateBackupUseCase deja tlsConfig en null si no hay HTTPS configurado", async () => {
  const { repo: backups, created } = makeBackupsRepo();
  const useCase = new CreateBackupUseCase(noopMonitors, backups, noopAuditLog, noopNotifications, noopUsers, noopTlsConfigs);

  await useCase.execute({ userId: "admin-1", strategy: "accumulate" });

  const payload = created[0].payload as any;
  assert.equal(payload.tlsConfig, null);
  assert.deepEqual(payload.admins, []);
  assert.deepEqual(payload.viewers, []);
  assert.deepEqual(payload.notifications, []);
});
