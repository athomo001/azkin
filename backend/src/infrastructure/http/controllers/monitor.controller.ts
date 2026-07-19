// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateMonitorUseCase } from "../../../application/use-cases/monitors/create-monitor.usecase";
import { ListMonitorsUseCase } from "../../../application/use-cases/monitors/list-monitors.usecase";
import { UpdateMonitorUseCase } from "../../../application/use-cases/monitors/update-monitor.usecase";
import { DeleteMonitorUseCase } from "../../../application/use-cases/monitors/delete-monitor.usecase";
import { BulkDeleteMonitorsUseCase } from "../../../application/use-cases/monitors/bulk-delete-monitors.usecase";
import { BulkImportMonitorsFromCsvUseCase } from "../../../application/use-cases/backup/bulk-import-monitors-from-csv.usecase";
import { ValidationError } from "../../../domain/errors/domain-error";
import { toMonitorResponse } from "../presenters/monitor.presenter";

export class MonitorController {
  constructor(
    private readonly createUseCase: CreateMonitorUseCase,
    private readonly listUseCase: ListMonitorsUseCase,
    private readonly updateUseCase: UpdateMonitorUseCase,
    private readonly deleteUseCase: DeleteMonitorUseCase,
    private readonly bulkDeleteUseCase: BulkDeleteMonitorsUseCase,
    private readonly bulkImportCsvUseCase: BulkImportMonitorsFromCsvUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const monitors = await this.listUseCase.execute(
      req.userId!,
      req.userRole!,
      req.adminId!,
      req.permissions!,
    );
    res.status(200).json(monitors.map(toMonitorResponse));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    // req.adminId resuelve al propietario efectivo (para un admin, es su propio id;
    // requireRole("admin") ya bloquea a los viewers antes de llegar aquí).
    const monitor = await this.createUseCase.execute({ userId: req.adminId!, ...req.body });
    res.status(201).json(toMonitorResponse(monitor));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    // Se realiza un cast explícito de req.params.id a string debido a que en Express 5
    // los parámetros de ruta pueden resolverse como string | string[].
    const id = req.params.id as string;
    const monitor = await this.updateUseCase.execute(req.adminId!, id, req.body);
    res.status(200).json(toMonitorResponse(monitor));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    // Se realiza un cast explícito de req.params.id a string por compatibilidad de tipos con Express 5.
    const id = req.params.id as string;
    await this.deleteUseCase.execute(req.adminId!, id);
    res.status(204).send();
  };

  bulkRemove = async (req: Request, res: Response): Promise<void> => {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
      throw new ValidationError("Se requiere un arreglo 'ids' no vacío de strings");
    }
    const result = await this.bulkDeleteUseCase.execute(req.adminId!, ids);
    res.status(200).json(result);
  };

  bulkImportCsv = async (req: Request, res: Response): Promise<void> => {
    const csv = req.body.csv;
    if (typeof csv !== "string" || !csv.trim()) {
      throw new ValidationError("Se requiere el campo 'csv' con el contenido del archivo");
    }
    const result = await this.bulkImportCsvUseCase.execute({ userId: req.adminId!, csv });
    res.status(200).json(result);
  };
}
