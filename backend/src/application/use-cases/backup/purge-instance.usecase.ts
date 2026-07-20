// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IApiKeyRepository } from "../../ports/repositories/api-key-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { IBackupRepository } from "../../ports/repositories/backup-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

export interface PurgeInstanceInput {
  firstAdminEmail?: string;
  firstAdminName?: string;
}

export interface PurgeInstanceOutput {
  keptAdminId: string;
  keptAdminIdentifier: string;
  deletedAdmins: number;
  deletedViewers: number;
  deletedMonitors: number;
  deletedNotifications: number;
  deletedApiKeys: number;
  deletedAuditLogs: number;
  deletedBackups: number;
  tlsConfigCleared: boolean;
}

/**
 * Caso de uso para "Purgar instancia": borra TODO (monitores, canales de notificación, API keys,
 * historial de auditoría, respaldos guardados, config TLS, y todas las demás cuentas admin/viewer)
 * dejando únicamente al admin sembrado por AZKIN_FIRST_ADMIN_EMAIL/AZKIN_FIRST_ADMIN_NAME del
 * .env actual — la instancia queda como recién instalada salvo por esa cuenta.
 *
 * Deliberadamente NO registra un log de auditoría al terminar: el historial completo se borra
 * como parte de la propia purga (alcance elegido explícitamente), así que dejar un registro
 * después contradiría el propio propósito de la acción.
 *
 * Irreversible: no crea un respaldo de seguridad antes de purgar (si existiera uno reciente,
 * también se borra). La UI debe exigir una confirmación explícita e inequívoca antes de invocarlo.
 */
export class PurgeInstanceUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly monitors: IMonitorRepository,
    private readonly notifications: INotificationRepository,
    private readonly apiKeys: IApiKeyRepository,
    private readonly auditLog: IAuditLogRepository,
    private readonly tlsConfigs: ITlsConfigRepository,
    private readonly backups: IBackupRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(input: PurgeInstanceInput): Promise<PurgeInstanceOutput> {
    const identifier = input.firstAdminEmail ?? input.firstAdminName;
    if (!identifier) {
      throw new ValidationError(
        "No hay AZKIN_FIRST_ADMIN_EMAIL ni AZKIN_FIRST_ADMIN_NAME configurado en el .env — no es posible determinar qué admin conservar.",
      );
    }

    const keepAdmin = await this.users.findByIdentifier(identifier);
    if (!keepAdmin || keepAdmin.role !== "admin") {
      throw new NotFoundError(
        `No existe ningún admin que coincida con '${identifier}' (AZKIN_FIRST_ADMIN_EMAIL/NAME) — purga cancelada para no dejar la instancia sin administradores.`,
      );
    }

    const activeMonitors = await this.monitors.findAllActive();
    for (const monitor of activeMonitors) this.scheduler.unschedule(monitor.id);

    const deletedMonitors = await this.monitors.deleteAll();
    const deletedNotifications = await this.notifications.deleteAll();
    const deletedApiKeys = await this.apiKeys.deleteAll();
    const deletedAuditLogs = await this.auditLog.deleteAll();
    const deletedBackups = await this.backups.deleteAll();
    const tlsConfigCleared = await this.tlsConfigs.deleteActive();
    const { deletedAdmins, deletedViewers } = await this.users.deleteAllUsersExcept(keepAdmin.id);

    return {
      keptAdminId: keepAdmin.id,
      keptAdminIdentifier: identifier,
      deletedAdmins,
      deletedViewers,
      deletedMonitors,
      deletedNotifications,
      deletedApiKeys,
      deletedAuditLogs,
      deletedBackups,
      tlsConfigCleared,
    };
  }
}
