// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { SendReportEmailUseCase } from "./send-report-email.usecase";
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { IReportDefinition } from "../../../domain/entities/report-definition";
import { getErrorMessage } from "../../services/get-error-message";
import { logger } from "../../../infrastructure/logger";

// El cron corre cada 15 minutos (ver composition-root.ts): una definición solo dispara si "ahora"
// cae dentro de los primeros SCHEDULE_WINDOW_MINUTES de su hora configurada.
const SCHEDULE_WINDOW_MINUTES = 15;
// Guarda mínima contra doble envío si el tick corre más de una vez dentro de la misma ventana
// horaria/día — más simple y robusto que comparar límites exactos de día/semana calendario.
const MIN_GAP_DAILY_MS = 20 * 60 * 60 * 1000; // 20h
const MIN_GAP_WEEKLY_MS = 6 * 24 * 60 * 60 * 1000; // 6 días

export interface ScheduledReportRunResult {
  definitionId: string;
  name: string;
  success: boolean;
  error?: string;
}

function wasSentRecently(definition: IReportDefinition, now: Date): boolean {
  if (!definition.lastSentAt) return false;
  const msSinceLastSent = now.getTime() - definition.lastSentAt.getTime();
  const minGapMs = definition.frequency === "daily" ? MIN_GAP_DAILY_MS : MIN_GAP_WEEKLY_MS;
  return msSinceLastSent < minGapMs;
}

function isDue(definition: IReportDefinition, now: Date): boolean {
  if (definition.hour !== now.getHours()) return false;
  if (now.getMinutes() >= SCHEDULE_WINDOW_MINUTES) return false;
  if (definition.frequency === "weekly" && definition.dayOfWeek !== now.getDay()) return false;
  return !wasSentRecently(definition, now);
}

/**
 * Invocado por el tick del cron (AZ-045): lista definiciones habilitadas, filtra las que
 * coinciden con la hora/día actual y no se enviaron recientemente, y envía cada una — un fallo en
 * una definición no detiene el envío del resto.
 */
export class RunScheduledReportsUseCase {
  constructor(
    private readonly reports: IReportDefinitionRepository,
    private readonly sendReportEmail: SendReportEmailUseCase,
  ) {}

  async execute(now: Date = new Date()): Promise<ScheduledReportRunResult[]> {
    const definitions = await this.reports.findEnabled();
    const due = definitions.filter((definition) => isDue(definition, now));

    const results: ScheduledReportRunResult[] = [];
    for (const definition of due) {
      try {
        await this.sendReportEmail.execute(definition, { now });
        results.push({ definitionId: definition.id, name: definition.name, success: true });
      } catch (err) {
        const message = getErrorMessage(err);
        logger.error(`[Reports] Fallo al enviar informe programado "${definition.name}": ${message}`);
        results.push({ definitionId: definition.id, name: definition.name, success: false, error: message });
      }
    }
    return results;
  }
}
