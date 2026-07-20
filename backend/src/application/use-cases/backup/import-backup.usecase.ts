// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { INotificationRepository } from "../../ports/repositories/notification-repository";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { QuotaExceededError } from "../../../domain/errors/domain-error";
import { ALERT_EVENT_TYPES } from "../../../domain/value-objects/alert-event-type";
import crypto from "crypto";

export interface ImportBackupInput {
  userId: string;
  monitors: Omit<CreateMonitorData, "userId" | "pushToken">[];
  notifications?: unknown[];
  admins?: unknown[];
  viewers?: unknown[];
  tlsConfig?: unknown | null;
}

export interface ImportSectionResult {
  createdCount: number;
  updatedCount: number;
  errors: { index: number; message: string }[];
}

export interface ImportBackupOutput {
  importedCount: number;
  updatedCount: number;
  admins: ImportSectionResult;
  viewers: ImportSectionResult;
  notifications: ImportSectionResult;
  tlsConfig: { applied: boolean; skippedReason?: string };
}

const backupAdminSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(100).optional(),
  passwordHash: z.string().min(1),
  isBlocked: z.boolean().optional(),
  preferences: z.object({ nyanCatMode: z.boolean() }).optional(),
});

const backupViewerSchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().min(1).max(100).optional(),
    passwordHash: z.string().min(1),
    adminIdentifier: z.string().min(1),
    permissions: z.array(z.object({ type: z.enum(["all", "group", "monitor"]), value: z.string().optional() })).default([]),
    isTvSessionEnabled: z.boolean().optional(),
  })
  .refine((v) => !!(v.email || v.username), { message: "email o username es requerido" });

const backupNotificationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["email", "slack", "telegram", "discord", "webhook"]),
  config: z.record(z.unknown()).default({}),
  isActive: z.boolean().optional(),
  events: z.union([z.literal("all"), z.array(z.enum(ALERT_EVENT_TYPES))]).optional(),
  templates: z.record(z.object({ subject: z.string().optional(), body: z.string() })).optional(),
});

const backupTlsConfigSchema = z.object({
  certPem: z.string().min(1),
  keyPemEncrypted: z.string().min(1),
  chainPem: z.string().optional(),
  port: z.number().int().min(1).max(65535),
  httpRedirect: z.boolean(),
});

/**
 * Caso de uso para restaurar un respaldo COMPLETO (create-backup.usecase.ts): admins/viewers
 * (con passwordHash), canales de notificación, configuración TLS y monitores — en ese orden,
 * porque viewers referencian a su admin propietario por email/username (`adminIdentifier`) y los
 * monitores no dependen de ninguno de los anteriores.
 *
 * Acepta también un respaldo v1.0 (solo `monitors`, sin las demás secciones): las secciones
 * ausentes simplemente no se procesan, no se rechaza el archivo completo.
 *
 * Cada sección acumula sus propios errores por fila en vez de abortar el resto del respaldo
 * (mismo criterio que ImportMonitorAssetsUseCase/BulkImportMonitorsFromCsvUseCase) — restaurar
 * una cuenta o canal inválido no debe impedir restaurar todo lo demás.
 */
export class ImportBackupUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
    private readonly notifications: INotificationRepository,
    private readonly users: IUserRepository,
    private readonly tlsConfigs: ITlsConfigRepository,
  ) {}

  async execute(input: ImportBackupInput): Promise<ImportBackupOutput> {
    const admins = await this.importAdmins(input.admins ?? []);
    const viewers = await this.importViewers(input.viewers ?? [], admins.identifierToId);
    const notificationsResult = await this.importNotifications(input.notifications ?? [], input.userId);
    const tlsConfig = await this.importTlsConfig(input.tlsConfig, input.userId);
    const { importedCount, updatedCount } = await this.importMonitors(input);

    return {
      importedCount,
      updatedCount,
      admins: admins.result,
      viewers,
      notifications: notificationsResult,
      tlsConfig,
    };
  }

  private async importAdmins(rawAdmins: unknown[]): Promise<{ result: ImportSectionResult; identifierToId: Map<string, string> }> {
    const result: ImportSectionResult = { createdCount: 0, updatedCount: 0, errors: [] };
    const identifierToId = new Map<string, string>();
    const existing = await this.users.findAllAdmins();
    for (const a of existing) {
      const key = (a.email ?? a.username ?? "").toLowerCase();
      if (key) identifierToId.set(key, a.id);
    }

    for (let index = 0; index < rawAdmins.length; index++) {
      const parsed = backupAdminSchema.safeParse(rawAdmins[index]);
      if (!parsed.success) {
        result.errors.push({ index, message: parsed.error.issues.map((i) => i.message).join("; ") });
        continue;
      }
      const data = parsed.data;
      const key = data.email.toLowerCase();
      try {
        const existingId = identifierToId.get(key);
        if (existingId) {
          await this.users.changePassword(existingId, data.passwordHash);
          if (data.isBlocked !== undefined) await this.users.setAdminBlocked(existingId, data.isBlocked);
          if (data.preferences) await this.users.updatePreferences(existingId, data.preferences);
          result.updatedCount++;
        } else {
          const created = await this.users.create({ email: data.email, username: data.username, passwordHash: data.passwordHash });
          identifierToId.set(key, created.id);
          if (data.isBlocked) await this.users.setAdminBlocked(created.id, true);
          if (data.preferences) await this.users.updatePreferences(created.id, data.preferences);
          result.createdCount++;
        }
      } catch (err) {
        result.errors.push({ index, message: err instanceof Error ? err.message : "Error desconocido al procesar el admin" });
      }
    }

    return { result, identifierToId };
  }

  private async importViewers(rawViewers: unknown[], adminIdentifierToId: Map<string, string>): Promise<ImportSectionResult> {
    const result: ImportSectionResult = { createdCount: 0, updatedCount: 0, errors: [] };
    const existing = await this.users.findAllViewersGlobal();
    const identifierToId = new Map<string, string>();
    for (const v of existing) {
      const key = (v.email ?? v.username ?? "").toLowerCase();
      if (key) identifierToId.set(key, v.id);
    }

    for (let index = 0; index < rawViewers.length; index++) {
      const parsed = backupViewerSchema.safeParse(rawViewers[index]);
      if (!parsed.success) {
        result.errors.push({ index, message: parsed.error.issues.map((i) => i.message).join("; ") });
        continue;
      }
      const data = parsed.data;
      const ownerAdminId = adminIdentifierToId.get(data.adminIdentifier.toLowerCase());
      if (!ownerAdminId) {
        result.errors.push({ index, message: `No se encontró el admin propietario '${data.adminIdentifier}' — impórtalo primero` });
        continue;
      }
      const key = (data.email ?? data.username ?? "").toLowerCase();
      try {
        const existingId = identifierToId.get(key);
        if (existingId) {
          const updated = await this.users.updateViewerPermissions(ownerAdminId, existingId, {
            permissions: data.permissions,
            isTvSessionEnabled: data.isTvSessionEnabled,
          });
          if (updated) result.updatedCount++;
          else result.errors.push({ index, message: "El viewer existe pero no pertenece al admin propietario indicado" });
        } else {
          await this.users.createViewer({
            email: data.email,
            username: data.username,
            passwordHash: data.passwordHash,
            role: "viewer",
            adminId: ownerAdminId,
            permissions: data.permissions,
            isTvSessionEnabled: data.isTvSessionEnabled,
          });
          result.createdCount++;
        }
      } catch (err) {
        result.errors.push({ index, message: err instanceof Error ? err.message : "Error desconocido al procesar el viewer" });
      }
    }

    return result;
  }

  private async importNotifications(rawNotifications: unknown[], actingUserId: string): Promise<ImportSectionResult> {
    const result: ImportSectionResult = { createdCount: 0, updatedCount: 0, errors: [] };
    const existing = await this.notifications.findAll();
    const idByName = new Map(existing.map((n) => [n.name, n.id]));

    for (let index = 0; index < rawNotifications.length; index++) {
      const parsed = backupNotificationSchema.safeParse(rawNotifications[index]);
      if (!parsed.success) {
        result.errors.push({ index, message: parsed.error.issues.map((i) => i.message).join("; ") });
        continue;
      }
      const data = parsed.data;
      try {
        const existingId = idByName.get(data.name);
        if (existingId) {
          await this.notifications.update(existingId, {
            config: data.config,
            isActive: data.isActive,
            events: data.events,
            templates: data.templates,
          });
          result.updatedCount++;
        } else {
          const created = await this.notifications.create({
            userId: actingUserId,
            name: data.name,
            type: data.type,
            config: data.config,
            isActive: data.isActive,
            events: data.events,
            templates: data.templates,
          });
          idByName.set(data.name, created.id);
          result.createdCount++;
        }
      } catch (err) {
        result.errors.push({ index, message: err instanceof Error ? err.message : "Error desconocido al procesar el canal" });
      }
    }

    return result;
  }

  private async importTlsConfig(rawTlsConfig: unknown, updatedById: string): Promise<{ applied: boolean; skippedReason?: string }> {
    if (rawTlsConfig === undefined) {
      return { applied: false, skippedReason: "El respaldo no incluye sección TLS (formato v1.0)" };
    }
    if (rawTlsConfig === null) {
      return { applied: false, skippedReason: "El respaldo no tenía TLS configurado" };
    }
    const parsed = backupTlsConfigSchema.safeParse(rawTlsConfig);
    if (!parsed.success) {
      return { applied: false, skippedReason: parsed.error.issues.map((i) => i.message).join("; ") };
    }
    await this.tlsConfigs.upsert({ ...parsed.data, updatedById });
    return { applied: true };
  }

  private async importMonitors(input: ImportBackupInput): Promise<{ importedCount: number; updatedCount: number }> {
    const existing = await this.monitors.findAll();
    const existingCount = existing.length;

    const existingMap = new Map(existing.map((m) => [`${m.name}-${m.target}`, m]));

    let importedCount = 0;
    let updatedCount = 0;

    let newCount = 0;
    for (const item of input.monitors) {
      const key = `${item.name}-${item.target}`;
      if (!existingMap.has(key)) {
        newCount++;
      }
    }

    if (existingCount + newCount > 50) {
      throw new QuotaExceededError(
        `La importación excede el límite de 50 monitores. Actuales: ${existingCount}, Nuevos a crear: ${newCount}`,
      );
    }

    for (const item of input.monitors) {
      const key = `${item.name}-${item.target}`;
      const found = existingMap.get(key);

      if (found) {
        const updated = await this.monitors.update(found.id, {
          ...item,
        });
        if (updated) {
          if (updated.isActive) {
            this.scheduler.reschedule(updated);
          } else {
            this.scheduler.unschedule(updated.id);
          }
          updatedCount++;
        }
      } else {
        let pushToken: string | undefined;
        if (item.type === "push") {
          pushToken = crypto.randomUUID();
        }

        const created = await this.monitors.create({
          ...item,
          userId: input.userId,
          pushToken,
        });

        if (created.isActive) {
          this.scheduler.schedule(created);
        }
        importedCount++;
      }
    }

    return { importedCount, updatedCount };
  }
}
