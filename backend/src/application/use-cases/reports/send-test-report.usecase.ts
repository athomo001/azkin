// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { SendReportEmailUseCase } from "./send-report-email.usecase";
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * "Enviar prueba" (AZ-045): envía el informe de una definición existente de inmediato, sin
 * esperar al cron y sin marcar `lastSentAt` (no debe interferir con el próximo envío programado).
 */
export class SendTestReportUseCase {
  constructor(
    private readonly reports: IReportDefinitionRepository,
    private readonly sendReportEmail: SendReportEmailUseCase,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<void> {
    const definition = await this.reports.findById(id);
    if (!definition) {
      throw new NotFoundError("Definición de informe no encontrada");
    }

    await this.sendReportEmail.execute(definition, { isTest: true, now: new Date() });

    await this.auditLog.record({
      actorId,
      action: "REPORT_SEND_TEST",
      targetType: "report-definition",
      targetIds: [id],
      metadata: { name: definition.name },
    });
  }
}
