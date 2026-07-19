// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import Papa from "papaparse";
import { z } from "zod";
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { QuotaExceededError } from "../../../domain/errors/domain-error";
import crypto from "crypto";

export interface BulkImportMonitorsFromCsvInput {
  userId: string;
  csv: string;
}

export interface BulkImportRowError {
  row: number;
  message: string;
}

export interface BulkImportMonitorsFromCsvOutput {
  createdCount: number;
  updatedCount: number;
  errors: BulkImportRowError[];
}

/** Fila del CSV: columnas planas; `tags` separadas por ';' dentro de la celda. */
const csvRowSchema = z
  .object({
    name: z.string().min(1).max(255),
    type: z.enum(["http", "ping", "port", "dns", "push", "snmp"]),
    target: z.string().min(1).max(512).optional(),
    port: z.coerce.number().int().min(1).max(65535).optional(),
    interval: z.coerce.number().int().min(20),
    retries: z.coerce.number().int().min(0).default(0),
    retryInterval: z.coerce.number().int().min(20).default(60),
    group: z.string().max(100).optional(),
    tags: z.string().optional(),
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
 * Caso de uso para importar monitores en lote desde un archivo CSV.
 * A diferencia de ImportBackupUseCase (JSON, aborta todo el lote ante un error), este caso de
 * uso acumula errores por fila y continúa procesando el resto, para que el admin pueda corregir
 * solo las filas problemáticas sin perder las válidas.
 */
export class BulkImportMonitorsFromCsvUseCase {
  constructor(
    private readonly monitors: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(input: BulkImportMonitorsFromCsvInput): Promise<BulkImportMonitorsFromCsvOutput> {
    // Un BOM UTF-8 (si el archivo se guardó/descargó con uno) debe recortarse ANTES de buscar la
    // directiva "sep=" de Excel, o la regex ancla contra el BOM en vez de contra "sep=" y nunca
    // matchea.
    let csvContent = input.csv.charCodeAt(0) === 0xfeff ? input.csv.slice(1) : input.csv;

    // Excel escribe una directiva "sep=<char>" como primera línea al abrir/guardar un CSV, para
    // forzar el delimitador sin importar la configuración regional (en locales que usan coma
    // como separador decimal, Excel espera ';' por defecto y de otro modo vuelca todo en una
    // sola columna). Papaparse no la entiende como directiva, así que se descarta antes de parsear.
    csvContent = csvContent.replace(/^sep=.\r?\n/, "");

    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      // Líneas que empiecen con '#' son comentarios del usuario (ej. la plantilla descargada
      // trae notas de uso) — se ignoran por completo, no son datos de un monitor.
      comments: "#",
      // Descarta también un BOM UTF-8 que haya quedado pegado al primer encabezado (algunos
      // editores/Excel lo agregan al guardar; Papaparse ya lo recorta del contenido, pero no
      // siempre del nombre de la primera columna parseada).
      transformHeader: (h) => (h.charCodeAt(0) === 0xfeff ? h.slice(1) : h).trim(),
    });

    const errors: BulkImportRowError[] = [];
    const validRows: { rowNumber: number; data: z.infer<typeof csvRowSchema> }[] = [];

    parsed.data.forEach((rawRow, idx) => {
      const rowNumber = idx + 2; // fila 1 es el encabezado
      // Papaparse produce "" para celdas vacías; se normaliza a undefined para que los
      // campos opcionales (ej. port) no fallen su coerción numérica (Number("") === 0).
      const normalizedRow = Object.fromEntries(
        Object.entries(rawRow).map(([k, v]) => [k, v === "" ? undefined : v]),
      );
      const result = csvRowSchema.safeParse(normalizedRow);
      if (!result.success) {
        errors.push({ row: rowNumber, message: result.error.issues.map((i) => i.message).join("; ") });
        return;
      }
      validRows.push({ rowNumber, data: result.data });
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

    for (const { rowNumber, data } of validRows) {
      try {
        const tags = data.tags ? data.tags.split(";").map((t) => t.trim()).filter(Boolean) : [];
        const target = data.target || "";
        const key = `${data.name}-${target}`;
        const found = existingMap.get(key);

        const payload: Omit<CreateMonitorData, "userId" | "pushToken"> = {
          name: data.name,
          type: data.type,
          target,
          port: data.port,
          interval: data.interval,
          retries: data.retries,
          retryInterval: data.retryInterval,
          group: data.group || null,
          tags,
          notificationIds: [],
        };

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
        errors.push({ row: rowNumber, message: err instanceof Error ? err.message : "Error desconocido al procesar la fila" });
      }
    }

    return { createdCount, updatedCount, errors };
  }
}
