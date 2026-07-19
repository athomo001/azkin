// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { GetHistoryUseCase } from "../../../application/use-cases/stats/get-history.usecase";
import { GetGroupsUseCase } from "../../../application/use-cases/stats/get-groups.usecase";
import { GetGroupOverviewUseCase } from "../../../application/use-cases/stats/get-group-overview.usecase";
import { GetRecentEventsUseCase } from "../../../application/use-cases/stats/get-recent-events.usecase";
import { toHistoryResponse, toGroupOverviewResponse } from "../presenters/monitor.presenter";

/**
 * Controlador de Express para las rutas de estadísticas e historial.
 * Resuelve y mapea las llamadas a los casos de uso correspondientes e inyecta el contexto del Viewer o Admin.
 */
export class StatsController {
  private static readonly DEFAULT_DURATION_MS = 12 * 60 * 60 * 1000;
  private static readonly MIN_DURATION_MS = 5 * 60 * 1000;
  private static readonly MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly historyUseCase: GetHistoryUseCase,
    private readonly groupsUseCase: GetGroupsUseCase,
    private readonly groupOverviewUseCase: GetGroupOverviewUseCase,
    private readonly recentEventsUseCase: GetRecentEventsUseCase,
  ) {}

  history = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const rawDuration = req.query.durationMs;
    const parsedDuration = Number(rawDuration);
    const durationMs = Number.isFinite(parsedDuration)
      ? Math.max(StatsController.MIN_DURATION_MS, Math.min(StatsController.MAX_DURATION_MS, parsedDuration))
      : StatsController.DEFAULT_DURATION_MS;

    const beats = await this.historyUseCase.execute(
      req.userId!,
      req.userRole!,
      req.adminId!,
      req.permissions!,
      id,
      durationMs,
    );
    res.status(200).json(toHistoryResponse(id, beats));
  };

  groups = async (req: Request, res: Response): Promise<void> => {
    const list = await this.groupsUseCase.execute(
      req.userId!,
      req.userRole!,
      req.adminId!,
      req.permissions!,
    );
    res.status(200).json(list);
  };

  groupOverview = async (req: Request, res: Response): Promise<void> => {
    const groupName = req.params.groupName as string;
    const overview = await this.groupOverviewUseCase.execute(
      req.userId!,
      req.userRole!,
      req.adminId!,
      req.permissions!,
      groupName,
    );
    res.status(200).json(toGroupOverviewResponse(overview));
  };

  /**
   * Retorna los últimos 30 eventos/heartbeats de todos los monitores del usuario.
   */
  recentEvents = async (req: Request, res: Response): Promise<void> => {
    const result = await this.recentEventsUseCase.execute(
      req.userId!,
      req.userRole!,
      req.adminId!,
      req.permissions!,
    );
    res.status(200).json(result);
  };
}
