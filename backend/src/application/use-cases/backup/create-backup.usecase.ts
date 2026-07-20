// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { BackupStrategy, IBackup, IBackupAdmin, IBackupViewer } from "../../../domain/entities/backup";

export interface CreateBackupInput {
  userId: string;
  strategy: BackupStrategy;
}

export interface CreateBackupOutput {
  backup: IBackup;
  deletedCount: number;
}

/**
 * Caso de uso para generar un respaldo COMPLETO y atómico de la instancia: monitores, canales de
 * notificación, cuentas (admins/viewers, con `passwordHash`) y configuración TLS — todo en un
 * mismo snapshot, para que restaurarlo no deje la instancia a medias (sin usuarios ni canales).
 * En modo "replace", borra atómicamente los respaldos previos del usuario antes de insertar el nuevo.
 */
export class CreateBackupUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly backups: IBackupRepository,
    private readonly auditLog: IAuditLogRepository,
    private readonly notifications: INotificationRepository,
    private readonly users: IUserRepository,
    private readonly tlsConfigs: ITlsConfigRepository,
  ) {}

  async execute(input: CreateBackupInput): Promise<CreateBackupOutput> {
    const monitorList = await this.monitors.findAll();
    const mappedMonitors = monitorList.map((m) => {
      const { id, userId: _userId, createdAt, updatedAt, ...rest } = m;
      return rest;
    });

    const notificationList = await this.notifications.findAll();
    const mappedNotifications = notificationList.map((n) => {
      const { id, userId: _userId, createdAt, updatedAt, ...rest } = n;
      return rest;
    });

    const [adminList, viewerList] = await Promise.all([
      this.users.findAllAdmins(),
      this.users.findAllViewersGlobal(),
    ]);
    const adminIdentifierById = new Map(adminList.map((a) => [a.id, a.email ?? a.username ?? ""]));

    const mappedAdmins: IBackupAdmin[] = adminList.map((a) => ({
      email: a.email ?? "",
      username: a.username,
      passwordHash: a.passwordHash,
      isBlocked: a.isBlocked,
      preferences: a.preferences,
    }));

    const mappedViewers: IBackupViewer[] = viewerList.map((v) => ({
      email: v.email,
      username: v.username,
      passwordHash: v.passwordHash,
      adminIdentifier: (v.adminId && adminIdentifierById.get(v.adminId)) || "",
      permissions: v.permissions,
      isTvSessionEnabled: v.isTvSessionEnabled,
    }));

    const tlsConfig = await this.tlsConfigs.getActive();
    const mappedTlsConfig = tlsConfig
      ? {
          certPem: tlsConfig.certPem,
          keyPemEncrypted: tlsConfig.keyPemEncrypted,
          chainPem: tlsConfig.chainPem,
          port: tlsConfig.port,
          httpRedirect: tlsConfig.httpRedirect,
        }
      : null;

    let deletedCount = 0;
    if (input.strategy === "replace") {
      deletedCount = await this.backups.deleteAll();
    }

    const backup = await this.backups.create({
      userId: input.userId,
      strategy: input.strategy,
      payload: {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        monitors: mappedMonitors,
        notifications: mappedNotifications,
        admins: mappedAdmins,
        viewers: mappedViewers,
        tlsConfig: mappedTlsConfig,
      },
    });

    if (input.strategy === "replace") {
      await this.auditLog.record({
        actorId: input.userId,
        action: "BACKUP_REPLACE",
        targetType: "backup",
        metadata: { deletedCount },
      });
    }

    return { backup, deletedCount };
  }
}
