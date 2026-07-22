// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para eliminar una definición de informe.
 */
export class DeleteReportDefinitionUseCase {
  constructor(
    private readonly reports: IReportDefinitionRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<void> {
    const existing = await this.reports.findById(id);
    if (!existing) {
      throw new NotFoundError("Definición de informe no encontrada");
    }
    await this.reports.delete(id);

    await this.auditLog.record({
      actorId,
      action: "REPORT_DELETE",
      targetType: "report-definition",
      targetIds: [id],
      metadata: { name: existing.name },
    });
  }
}
