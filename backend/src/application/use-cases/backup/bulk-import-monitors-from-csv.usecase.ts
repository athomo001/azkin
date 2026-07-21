// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import Papa from "papaparse";
import { z } from "zod";
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
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

/**
 * Interpreta una celda de CSV como booleano sin el defecto clásico de `z.coerce.boolean()`
 * (que hace `Boolean("false") === true`, porque cualquier string no vacío es verdadero para
 * JS): acepta true/false/1/0/si/sí/no, sin distinguir mayúsculas, y trata la celda vacía o
 * ausente como `false` (mismo default que crear un monitor a mano desde la UI).
 */
const booleanFromCsvCell = z.preprocess((val) => {
  if (typeof val === "boolean") return val;
  if (val === undefined || val === "") return false;
  const normalized = String(val).trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "si" || normalized === "sí" || normalized === "yes";
}, z.boolean());

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
    // Columna opcional: ausente/vacía = false (valida el certificado TLS), igual que crear un
    // monitor a mano. Solo tiene efecto para type=http (los demás tipos la ignoran en el checker).
    ignoreTls: booleanFromCsvCell,
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
    private readonly auditLog: IAuditLogRepository,
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

    // Se conserva 'comments: "#"' porque ayuda a Papaparse a adivinar el delimitador real del
    // archivo (sin ella, las líneas de prosa del comentario diluyen la muestra y el auto-detect
    // falla). Pero esa opción por sí sola NO es suficiente para descartar comentarios: solo mira
    // el caracter crudo al inicio de la línea, ANTES de interpretar comillas. Si una celda de
    // comentario del usuario queda citada (ej. porque contiene el propio delimitador del
    // archivo — común cuando la plantilla se reabre y regraba con Excel/Sheets en una
    // configuración regional que usa ';' como separador de columnas, ya que entonces cualquier
    // ';' *dentro* de un comentario debe citarse para no cortarlo en columnas), esa línea deja
    // de "empezar con #" a nivel de texto crudo: Papaparse ya no la reconoce como comentario y
    // se cuela como si fuera una fila más. Por eso parseamos sin 'header' y filtramos nosotros
    // mismos por la PRIMERA CELDA YA PARSEADA (con comillas resueltas) antes de decidir cuál fila
    // es el encabezado — inmune a esto sin importar qué delimitador termine usando el archivo.
    const rawParsed = Papa.parse<string[]>(csvContent, { skipEmptyLines: true, comments: "#" });
    const dataRows = rawParsed.data.filter((row) => {
      const firstCell = (row[0] ?? "").trim();
      return firstCell.length > 0 && !firstCell.startsWith("#");
    });

    const errors: BulkImportRowError[] = [];
    const validRows: { rowNumber: number; data: z.infer<typeof csvRowSchema> }[] = [];

    if (dataRows.length > 0) {
      const [rawHeader, ...bodyRows] = dataRows;
      // Descarta un BOM UTF-8 que haya quedado pegado al primer encabezado (algunos
      // editores/Excel lo agregan al guardar; ya se recorta del contenido completo más arriba,
      // pero no siempre del nombre de la primera columna parseada).
      const header = rawHeader.map((h) => (h.charCodeAt(0) === 0xfeff ? h.slice(1) : h).trim());

      bodyRows.forEach((row, idx) => {
        const rowNumber = idx + 2; // fila 1 es el encabezado
        const rawRow = Object.fromEntries(header.map((key, i) => [key, row[i]]));
        // Papaparse produce "" (o undefined si la fila es más corta que el encabezado) para
        // celdas vacías; se normaliza a undefined para que los campos opcionales (ej. port) no
        // fallen su coerción numérica (Number("") === 0).
        const normalizedRow = Object.fromEntries(
          Object.entries(rawRow).map(([k, v]) => [k, v === "" || v === undefined ? undefined : v]),
        );
        const result = csvRowSchema.safeParse(normalizedRow);
        if (!result.success) {
          errors.push({ row: rowNumber, message: result.error.issues.map((i) => i.message).join("; ") });
          return;
        }
        validRows.push({ rowNumber, data: result.data });
      });
    }

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
          ignoreTls: data.ignoreTls,
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

    await this.auditLog.record({
      actorId: input.userId,
      action: "MONITORS_CSV_IMPORT",
      targetType: "monitor",
      metadata: { createdCount, updatedCount, errorCount: errors.length },
    });

    return { createdCount, updatedCount, errors };
  }
}
