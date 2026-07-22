// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateReportDefinitionUseCase } from "../../../application/use-cases/reports/create-report-definition.usecase";
import { ListReportDefinitionsUseCase } from "../../../application/use-cases/reports/list-report-definitions.usecase";
import { UpdateReportDefinitionUseCase } from "../../../application/use-cases/reports/update-report-definition.usecase";
import { DeleteReportDefinitionUseCase } from "../../../application/use-cases/reports/delete-report-definition.usecase";
import { SendTestReportUseCase } from "../../../application/use-cases/reports/send-test-report.usecase";
import { DownloadReportPdfUseCase } from "../../../application/use-cases/reports/download-report-pdf.usecase";
import { toReportDefinitionResponse } from "../presenters/report-definition.presenter";

export class ReportController {
  constructor(
    private readonly createUseCase: CreateReportDefinitionUseCase,
    private readonly listUseCase: ListReportDefinitionsUseCase,
    private readonly updateUseCase: UpdateReportDefinitionUseCase,
    private readonly deleteUseCase: DeleteReportDefinitionUseCase,
    private readonly sendTestUseCase: SendTestReportUseCase,
    private readonly downloadPdfUseCase: DownloadReportPdfUseCase,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const definitions = await this.listUseCase.execute();
    res.status(200).json(definitions.map(toReportDefinitionResponse));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const createdBy = req.userId!;
    const definition = await this.createUseCase.execute({
      createdBy,
      name: req.body.name,
      enabled: req.body.enabled,
      frequency: req.body.frequency,
      scope: req.body.scope,
      hour: req.body.hour,
      dayOfWeek: req.body.dayOfWeek,
      recipientMode: req.body.recipientMode,
      recipientEmails: req.body.recipientEmails,
    });
    res.status(201).json(toReportDefinitionResponse(definition));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const definition = await this.updateUseCase.execute(req.userId!, id, {
      name: req.body.name,
      enabled: req.body.enabled,
      frequency: req.body.frequency,
      scope: req.body.scope,
      hour: req.body.hour,
      dayOfWeek: req.body.dayOfWeek,
      recipientMode: req.body.recipientMode,
      recipientEmails: req.body.recipientEmails,
    });
    res.status(200).json(toReportDefinitionResponse(definition));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.deleteUseCase.execute(req.userId!, id);
    res.status(204).send();
  };

  sendTest = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.sendTestUseCase.execute(req.userId!, id);
    res.status(200).json({ sent: true });
  };

  downloadPdf = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { filename, buffer } = await this.downloadPdfUseCase.execute(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(buffer);
  };
}
