// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";
import { IMonitorRepository } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { QuotaExceededError } from "../../../domain/errors/domain-error";
import crypto from "crypto";

export interface ImportMonitorAssetsInput {
  userId: string;
  monitors: unknown[];
}

export interface ImportAssetError {
  index: number;
  name?: string;
  message: string;
}

export interface ImportMonitorAssetsOutput {
  createdCount: number;
  updatedCount: number;
  errors: ImportAssetError[];
}

const visualMaskSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

/**
 * Mismas reglas que crear un monitor por API (createMonitorSchema en infrastructure/http):
 * un activo importado debe ser válido exactamente igual que cualquier monitor creado a mano.
 * Se define localmente (no se importa desde infrastructure/http/schemas) para no violar la
 * regla de dependencia hacia adentro de Clean Architecture — mismo criterio que csvRowSchema
 * en bulk-import-monitors-from-csv.usecase.ts.
 *
 * `notificationIds` y `pushToken` se aceptan si vienen en el JSON (para no rechazar un archivo
 * exportado por una versión futura que los incluya) pero se ignoran deliberadamente más abajo:
 * las notificaciones de la instancia de origen no existen en destino, y el pushToken se regenera.
 */
const monitorAssetSchema = z
  .object({
    name: z.string().min(1).max(255),
    type: z.enum(["http", "ping", "port", "dns", "push", "snmp"]),
    target: z.string().min(1).max(512).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    interval: z.number().int().min(20),
    retries: z.number().int().min(0).default(0),
    retryInterval: z.number().int().min(20).default(60),
    group: z.string().max(100).nullable().optional(),
    tags: z.array(z.string().max(50)).max(10).default([]),
    keyword: z.string().optional(),
    keywordMethod: z.enum(["presence", "absence"]).optional(),
    dnsResolver: z.string().optional(),
    dnsRecordType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT"]).optional(),
    snmpVersion: z.enum(["v1", "v2c", "v3"]).optional(),
    snmpCommunity: z.string().optional(),
    snmpPort: z.number().int().min(1).max(65535).optional(),
    snmpOid: z.string().optional(),
    snmpV3Username: z.string().optional(),
    snmpV3AuthProtocol: z.enum(["md5", "sha"]).optional(),
    snmpV3AuthKey: z.string().optional(),
    snmpV3PrivProtocol: z.enum(["des", "aes"]).optional(),
    snmpV3PrivKey: z.string().optional(),
    headers: z.record(z.string()).optional(),
    userAgent: z.string().optional(),
    ignoreTls: z.boolean().optional(),
    sameHostAsAzkin: z.boolean().optional(),
    integrityEnabled: z.boolean().optional(),
    integrityProfile: z.enum(["static", "dynamic"]).optional(),
    integrityIgnoredCssSelectors: z.array(z.string()).optional(),
    integrityVisualMasks: z.array(visualMaskSchema).optional(),
    integrityAllowedScripts: z.array(z.string()).optional(),
    integrityThreshold: z.number().min(0).max(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "push" && !data.target) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "target es requerido salvo para type=push", path: ["target"] });
    }
    if (data.type === "port" && data.port === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "port es requerido cuando type=port", path: ["port"] });
    }
  });

/**
 * Caso de uso para importar activos de monitoreo exportados desde otra instancia de Azkin
 * (ExportMonitorAssetsUseCase). Acumula errores por fila y continúa con el resto del lote
 * (igual que BulkImportMonitorsFromCsvUseCase) en vez de abortar todo ante un solo activo
 * inválido — a diferencia de ImportBackupUseCase, pensado para restaurar un respaldo propio
 * completo y confiable, no para recibir un archivo potencialmente editado a mano.
 */
export class ImportMonitorAssetsUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: ImportMonitorAssetsInput): Promise<ImportMonitorAssetsOutput> {
    const errors: ImportAssetError[] = [];
    const validRows: { index: number; data: z.infer<typeof monitorAssetSchema> }[] = [];

    input.monitors.forEach((raw, index) => {
      // Varios campos de Monitor tienen `default: null` en Mongoose (keyword, dnsResolver,
      // group, pushToken) en vez de quedar simplemente ausentes — un monitor exportado que
      // nunca los configuró trae `null` literal, no `undefined`. El schema de abajo modela esos
      // campos como "opcionales" (ausentes), no "nulables", así que se normaliza null -> undefined
      // ANTES de validar: evita repetir este mismo bug cada vez que se agregue un campo nuevo con
      // ese mismo patrón de default en el esquema de Mongoose.
      const normalized =
        raw && typeof raw === "object"
          ? Object.fromEntries(Object.entries(raw as Record<string, unknown>).map(([k, v]) => [k, v === null ? undefined : v]))
          : raw;
      const result = monitorAssetSchema.safeParse(normalized);
      if (!result.success) {
        const name = typeof (raw as { name?: unknown })?.name === "string" ? (raw as { name: string }).name : undefined;
        errors.push({ index, name, message: result.error.issues.map((i) => i.message).join("; ") });
        return;
      }
      validRows.push({ index, data: result.data });
    });

    const existing = await this.monitors.findAll();
    const existingMap = new Map(existing.map((m) => [`${m.name}-${m.target}`, m]));

    const newCount = validRows.filter((r) => !existingMap.has(`${r.data.name}-${r.data.target ?? ""}`)).length;
    if (existing.length + newCount > 50) {
      throw new QuotaExceededError(
        `La importación excede el límite de 50 monitores. Actuales: ${existing.length}, Nuevos a crear: ${newCount}`,
      );
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const { index, data } of validRows) {
      try {
        const target = data.target ?? "";
        const key = `${data.name}-${target}`;
        const found = existingMap.get(key);
        // notificationIds e id/userId/pushToken del origen se descartan siempre: nunca se leen
        // del JSON importado, sin importar qué haya venido en el archivo (ver docstring del
        // schema más arriba).
        const payload = { ...data, target, group: data.group ?? null, notificationIds: [] as string[] };

        if (found) {
          const updated = await this.monitors.update(found.id, payload);
          if (updated) {
            if (updated.isActive) this.scheduler.reschedule(updated);
            else this.scheduler.unschedule(updated.id);
            updatedCount++;
          }
        } else {
          const pushToken = data.type === "push" ? crypto.randomUUID() : undefined;
          const created = await this.monitors.create({ ...payload, userId: input.userId, pushToken });
          if (created.isActive) this.scheduler.schedule(created);
          createdCount++;
        }
      } catch (err) {
        errors.push({ index, name: data.name, message: err instanceof Error ? err.message : "Error desconocido al procesar el activo" });
      }
    }

    await this.auditLog.record({
      actorId: input.userId,
      action: "MONITORS_ASSETS_IMPORT",
      targetType: "monitor",
      metadata: { createdCount, updatedCount, errorCount: errors.length },
    });

    return { createdCount, updatedCount, errors };
  }
}
