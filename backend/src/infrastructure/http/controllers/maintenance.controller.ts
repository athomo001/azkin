// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { CreateMaintenanceWindowUseCase } from "../../../application/use-cases/maintenance/create-maintenance-window.usecase";
import { ListMaintenanceWindowsUseCase } from "../../../application/use-cases/maintenance/list-maintenance-windows.usecase";
import { UpdateMaintenanceWindowUseCase } from "../../../application/use-cases/maintenance/update-maintenance-window.usecase";
import { EndMaintenanceWindowUseCase } from "../../../application/use-cases/maintenance/end-maintenance-window.usecase";
import { DeleteMaintenanceWindowUseCase } from "../../../application/use-cases/maintenance/delete-maintenance-window.usecase";
import { toMaintenanceWindowResponse } from "../presenters/maintenance.presenter";

export class MaintenanceController {
  constructor(
    private readonly createUseCase: CreateMaintenanceWindowUseCase,
    private readonly listUseCase: ListMaintenanceWindowsUseCase,
    private readonly updateUseCase: UpdateMaintenanceWindowUseCase,
    private readonly endUseCase: EndMaintenanceWindowUseCase,
    private readonly deleteUseCase: DeleteMaintenanceWindowUseCase,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const windows = await this.listUseCase.execute();
    res.status(200).json(windows.map(toMaintenanceWindowResponse));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const createdBy = req.userId!;
    const window = await this.createUseCase.execute({
      createdBy,
      name: req.body.name,
      description: req.body.description,
      scope: req.body.scope,
      mode: req.body.mode,
      startAt: req.body.startAt ?? null,
      endAt: req.body.endAt ?? null,
    });
    res.status(201).json(toMaintenanceWindowResponse(window));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const window = await this.updateUseCase.execute(req.userId!, id, {
      name: req.body.name,
      description: req.body.description,
      scope: req.body.scope,
      startAt: req.body.startAt,
      endAt: req.body.endAt,
    });
    res.status(200).json(toMaintenanceWindowResponse(window));
  };

  end = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const window = await this.endUseCase.execute(req.userId!, id);
    res.status(200).json(toMaintenanceWindowResponse(window));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.deleteUseCase.execute(req.userId!, id);
    res.status(204).send();
  };
}
