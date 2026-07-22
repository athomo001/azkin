// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  CreateReportDefinitionData,
  IReportDefinitionRepository,
} from "../../ports/repositories/report-definition-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IReportDefinition } from "../../../domain/entities/report-definition";

/**
 * Caso de uso para crear una definición de informe periódico de disponibilidad (AZ-045).
 */
export class CreateReportDefinitionUseCase {
  constructor(
    private readonly reports: IReportDefinitionRepository,
    private readonly auditLog: IAuditLogRepository,
  ) {}

  async execute(input: CreateReportDefinitionData): Promise<IReportDefinition> {
    const definition = await this.reports.create(input);

    await this.auditLog.record({
      actorId: input.createdBy,
      action: "REPORT_CREATE",
      targetType: "report-definition",
      targetIds: [definition.id],
      metadata: { name: definition.name, frequency: definition.frequency, scope: definition.scope },
    });

    return definition;
  }
}
