// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { GenerateReportDataUseCase } from "./generate-report-data.usecase";
import { IReportPdfRenderer } from "../../ports/services/report-pdf-renderer";
import { IReportDefinitionRepository } from "../../ports/repositories/report-definition-repository";
import { NotFoundError } from "../../../domain/errors/domain-error";

export interface DownloadedReportPdf {
  filename: string;
  buffer: Buffer;
}

/**
 * "Descargar PDF de hoy/esta semana" (AZ-045): genera el PDF bajo demanda sin enviar correo.
 */
export class DownloadReportPdfUseCase {
  constructor(
    private readonly reports: IReportDefinitionRepository,
    private readonly generateReportData: GenerateReportDataUseCase,
    private readonly pdfRenderer: IReportPdfRenderer,
  ) {}

  async execute(id: string): Promise<DownloadedReportPdf> {
    const definition = await this.reports.findById(id);
    if (!definition) {
      throw new NotFoundError("Definición de informe no encontrada");
    }

    const data = await this.generateReportData.execute({
      definitionName: definition.name,
      frequency: definition.frequency,
      scope: definition.scope,
      to: new Date(),
    });

    const buffer = await this.pdfRenderer.render(data);
    const dateStamp = data.to.toISOString().slice(0, 10);
    return { filename: `informe-${definition.id}-${dateStamp}.pdf`, buffer };
  }
}
