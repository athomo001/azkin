// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { IReportDefinition } from "../../../domain/entities/report-definition";

/**
 * Caso de uso para listar todas las definiciones de informes (AZ-045), sin aislamiento por
 * tenant — mismo criterio que ventanas de mantenimiento y canales de notificación.
 */
export class ListReportDefinitionsUseCase {
  constructor(private readonly reports: IReportDefinitionRepository) {}

  async execute(): Promise<IReportDefinition[]> {
    return this.reports.findAll();
  }
}
