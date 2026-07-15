import { Request, Response } from "express";
import { CreateMonitorUseCase } from "../../../application/use-cases/monitors/create-monitor.usecase";
import { ListMonitorsUseCase } from "../../../application/use-cases/monitors/list-monitors.usecase";
import { UpdateMonitorUseCase } from "../../../application/use-cases/monitors/update-monitor.usecase";
import { DeleteMonitorUseCase } from "../../../application/use-cases/monitors/delete-monitor.usecase";
import { toMonitorResponse } from "../presenters/monitor.presenter";

export class MonitorController {
  constructor(
    private readonly createUseCase: CreateMonitorUseCase,
    private readonly listUseCase: ListMonitorsUseCase,
    private readonly updateUseCase: UpdateMonitorUseCase,
    private readonly deleteUseCase: DeleteMonitorUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const monitors = await this.listUseCase.execute(req.userId!);
    res.status(200).json(monitors.map(toMonitorResponse));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const monitor = await this.createUseCase.execute({ userId: req.userId!, ...req.body });
    res.status(201).json(toMonitorResponse(monitor));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    // Se realiza un cast explícito de req.params.id a string debido a que en Express 5
    // los parámetros de ruta pueden resolverse como string | string[].
    const id = req.params.id as string;
    const monitor = await this.updateUseCase.execute(req.userId!, id, req.body);
    res.status(200).json(toMonitorResponse(monitor));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    // Se realiza un cast explícito de req.params.id a string por compatibilidad de tipos con Express 5.
    const id = req.params.id as string;
    await this.deleteUseCase.execute(req.userId!, id);
    res.status(204).send();
  };
}
