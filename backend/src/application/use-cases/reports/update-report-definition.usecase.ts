// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  IReportDefinitionRepository,
  UpdateReportDefinitionData,
} from "../../ports/repositories/report-definition-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { diffFields } from "../../services/diff-fields";
import { IReportDefinition } from "../../../domain/entities/report-definition";
import { NotFoundError } from "../../../domain/errors/domain-error";

/**
 * Caso de uso para editar una definición de informe (nombre, alcance, horario, destinatarios).
 */
export class UpdateReportDefinitionUseCase {
  constructor(
    private readonly reports: IReportDefinitionRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(actorId: string, id: string, data: UpdateReportDefinitionData): Promise<IReportDefinition> {
    const existing = await this.reports.findById(id);
    if (!existing) {
      throw new NotFoundError("Definición de informe no encontrada");
    }

    const updated = await this.reports.update(id, data);
    if (!updated) {
      throw new NotFoundError("Definición de informe no encontrada");
    }

    await this.auditLog.record({
      actorId,
      action: "REPORT_UPDATE",
      targetType: "report-definition",
      targetIds: [id],
      metadata: {
        changes: diffFields(existing as unknown as Record<string, unknown>, data as unknown as Record<string, unknown>),
      },
    });

    return updated;
  }
}
