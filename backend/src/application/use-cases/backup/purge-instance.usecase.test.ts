// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { PurgeInstanceUseCase } from "./purge-instance.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IApiKeyRepository } from "../../ports/repositories/api-key-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IMonitor } from "../../../domain/entities/monitor";
import { IUser } from "../../../domain/entities/user";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

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

function makeSeedAdmin(): IUser {
  return {
    id: "admin-seed",
    email: "seed@azkin.test",
    username: "seed",
    passwordHash: "hash",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeUsersRepo(seedAdmin: IUser | null, deleteAllUsersExcept?: IUserRepository["deleteAllUsersExcept"]): IUserRepository {
  return {
    create: async () => { throw new Error("not implemented"); },
    findByEmail: async () => null,
    findByIdentifier: async (identifier) => (seedAdmin && (seedAdmin.email === identifier || seedAdmin.username === identifier) ? seedAdmin : null),
    findById: async () => null,
    changePassword: async () => true,
    countAdmins: async () => 1,
    findAllAdmins: async () => (seedAdmin ? [seedAdmin] : []),
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
    deleteAllUsersExcept: deleteAllUsersExcept ?? (async () => ({ deletedAdmins: 0, deletedViewers: 0 })),
  };
}

function makeDeps(overrides: {
  users: IUserRepository;
  monitors?: Partial<IMonitorRepository>;
  notifications?: Partial<INotificationRepository>;
  apiKeys?: Partial<IApiKeyRepository>;
  auditLog?: Partial<IAuditLogRepository>;
  tlsConfigs?: Partial<ITlsConfigRepository>;
  backups?: Partial<IBackupRepository>;
  scheduler?: Partial<IScheduler>;
}) {
  const unscheduled: string[] = [];
  const monitors: IMonitorRepository = {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    deleteMany: async () => 0,
    deleteAll: async () => 3,
    findAllActive: async () => [makeMonitor()],
    distinctTags: async () => [],
    ...overrides.monitors,
  };
  const notifications: INotificationRepository = {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findById: async () => null,
    update: async () => null,
    delete: async () => true,
    deleteAll: async () => 2,
    ...overrides.notifications,
  };
  const apiKeys: IApiKeyRepository = {
    create: async () => { throw new Error("not implemented"); },
    findByHash: async () => null,
    findAllByAdmin: async () => [],
    revoke: async () => true,
    delete: async () => true,
    touchLastUsed: async () => undefined,
    deleteAll: async () => 1,
    ...overrides.apiKeys,
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 5,
    ...overrides.auditLog,
  };
  const tlsConfigs: ITlsConfigRepository = {
    getActive: async () => null,
    upsert: async () => { throw new Error("not implemented"); },
    deleteActive: async () => true,
    ...overrides.tlsConfigs,
  };
  const backups: IBackupRepository = {
    create: async () => { throw new Error("not implemented"); },
    findAll: async () => [],
    findById: async () => null,
    deleteAll: async () => 4,
    ...overrides.backups,
  };
  const scheduler: IScheduler = {
    start: async () => undefined,
    schedule: () => undefined,
    reschedule: () => undefined,
    unschedule: (id) => unscheduled.push(id),
    stopAll: () => undefined,
    receivePushHeartbeat: async () => undefined,
    ...overrides.scheduler,
  };
  return { monitors, notifications, apiKeys, auditLog, tlsConfigs, backups, scheduler, unscheduled };
}

test("PurgeInstanceUseCase borra todo (monitores, canales, api keys, auditoría, respaldos, TLS y demás cuentas) conservando solo al admin de AZKIN_FIRST_ADMIN_EMAIL", async () => {
  const seedAdmin = makeSeedAdmin();
  let purgeExceptCalledWith: string | undefined;
  const users = makeUsersRepo(seedAdmin, async (keepUserId) => {
    purgeExceptCalledWith = keepUserId;
    return { deletedAdmins: 2, deletedViewers: 3 };
  });
  const { monitors, notifications, apiKeys, auditLog, tlsConfigs, backups, scheduler, unscheduled } = makeDeps({ users });

  const useCase = new PurgeInstanceUseCase(users, monitors, notifications, apiKeys, auditLog, tlsConfigs, backups, scheduler);
  const result = await useCase.execute({ firstAdminEmail: "seed@azkin.test" });

  assert.equal(result.keptAdminId, "admin-seed");
  assert.equal(purgeExceptCalledWith, "admin-seed");
  assert.equal(result.deletedAdmins, 2);
  assert.equal(result.deletedViewers, 3);
  assert.equal(result.deletedMonitors, 3);
  assert.equal(result.deletedNotifications, 2);
  assert.equal(result.deletedApiKeys, 1);
  assert.equal(result.deletedAuditLogs, 5);
  assert.equal(result.deletedBackups, 4);
  assert.equal(result.tlsConfigCleared, true);
  assert.deepEqual(unscheduled, ["m-1"]);
});

test("PurgeInstanceUseCase rechaza la purga si no hay AZKIN_FIRST_ADMIN_EMAIL ni AZKIN_FIRST_ADMIN_NAME configurado, sin borrar nada", async () => {
  const users = makeUsersRepo(null);
  const { monitors, notifications, apiKeys, auditLog, tlsConfigs, backups, scheduler } = makeDeps({ users });
  let monitorsDeleted = false;
  monitors.deleteAll = async () => {
    monitorsDeleted = true;
    return 0;
  };

  const useCase = new PurgeInstanceUseCase(users, monitors, notifications, apiKeys, auditLog, tlsConfigs, backups, scheduler);

  await assert.rejects(() => useCase.execute({}), ValidationError);
  assert.equal(monitorsDeleted, false);
});

test("PurgeInstanceUseCase cancela la purga si el admin de AZKIN_FIRST_ADMIN_EMAIL/NAME no existe, sin borrar nada", async () => {
  const users = makeUsersRepo(null);
  const { monitors, notifications, apiKeys, auditLog, tlsConfigs, backups, scheduler } = makeDeps({ users });
  let monitorsDeleted = false;
  monitors.deleteAll = async () => {
    monitorsDeleted = true;
    return 0;
  };

  const useCase = new PurgeInstanceUseCase(users, monitors, notifications, apiKeys, auditLog, tlsConfigs, backups, scheduler);

  await assert.rejects(() => useCase.execute({ firstAdminEmail: "no-existe@azkin.test" }), NotFoundError);
  assert.equal(monitorsDeleted, false);
});
