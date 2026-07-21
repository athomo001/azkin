// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { GetHistoryUseCase } from "../../../application/use-cases/stats/get-history.usecase";
import { GetGroupsUseCase } from "../../../application/use-cases/stats/get-groups.usecase";
import { GetGroupOverviewUseCase } from "../../../application/use-cases/stats/get-group-overview.usecase";
import { GetRecentEventsUseCase } from "../../../application/use-cases/stats/get-recent-events.usecase";
import { GetMonitorEventsUseCase } from "../../../application/use-cases/stats/get-monitor-events.usecase";
import { GetGroupEventsUseCase } from "../../../application/use-cases/stats/get-group-events.usecase";
import { toHistoryResponse, toGroupOverviewResponse } from "../presenters/monitor.presenter";

/**
 * Controlador de Express para las rutas de estadísticas e historial.
 * Resuelve y mapea las llamadas a los casos de uso correspondientes e inyecta el contexto del Viewer o Admin.
 */
export class StatsController {
  private static readonly DEFAULT_DURATION_MS = 12 * 60 * 60 * 1000;
  private static readonly MIN_DURATION_MS = 5 * 60 * 1000;
  private static readonly MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

  // Ventanas para la tabla de eventos (heartbeats crudos, no agregados): más acotadas que el
  // historial del gráfico porque cada fila es un heartbeat individual, no un punto bucketeado.
  private static readonly EVENTS_DEFAULT_DURATION_MS = 30 * 60 * 1000;
  private static readonly EVENTS_MIN_DURATION_MS = 60 * 1000;
  private static readonly EVENTS_MAX_DURATION_MS = 48 * 60 * 60 * 1000;

  constructor(
    private readonly historyUseCase: GetHistoryUseCase,
    private readonly groupsUseCase: GetGroupsUseCase,
    private readonly groupOverviewUseCase: GetGroupOverviewUseCase,
    private readonly recentEventsUseCase: GetRecentEventsUseCase,
    private readonly monitorEventsUseCase: GetMonitorEventsUseCase,
    private readonly groupEventsUseCase: GetGroupEventsUseCase,
  ) {}

  private parseEventsDuration(rawDuration: unknown): number {
    const parsed = Number(rawDuration);
    return Number.isFinite(parsed)
      ? Math.max(StatsController.EVENTS_MIN_DURATION_MS, Math.min(StatsController.EVENTS_MAX_DURATION_MS, parsed))
      : StatsController.EVENTS_DEFAULT_DURATION_MS;
  }

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

  /**
   * Eventos (heartbeats individuales) de UN monitor en una ventana de tiempo — tabla bajo el
   * gráfico de detalle de monitor. `durationMs` acepta desde 1 minuto hasta 48h.
   */
  monitorEvents = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const durationMs = this.parseEventsDuration(req.query.durationMs);
    const result = await this.monitorEventsUseCase.execute(
      req.userId!,
      req.userRole!,
      req.adminId!,
      req.permissions!,
      id,
      durationMs,
    );
    res.status(200).json(result);
  };

  /**
   * Igual que `monitorEvents` pero para todos los monitores de un Monitor Group.
   */
  groupEvents = async (req: Request, res: Response): Promise<void> => {
    const groupName = req.params.groupName as string;
    const durationMs = this.parseEventsDuration(req.query.durationMs);
    const result = await this.groupEventsUseCase.execute(
      req.userId!,
      req.userRole!,
      req.adminId!,
      req.permissions!,
      groupName,
      durationMs,
    );
    res.status(200).json(result);
  };
}
