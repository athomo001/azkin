// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { GetHistoryUseCase } from "../../../application/use-cases/stats/get-history.usecase";
import { GetGroupsUseCase } from "../../../application/use-cases/stats/get-groups.usecase";
import { GetGroupOverviewUseCase } from "../../../application/use-cases/stats/get-group-overview.usecase";
import { IMonitorRepository } from "../../../application/ports/repositories/monitor-repository";
import { filterMonitorsByPermission } from "../../../application/services/monitor-access-policy";
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
    private readonly monitorsRepo: IMonitorRepository,
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
    // Sin aislamiento por tenant: parte del pool global y filtra por permisos si es viewer.
    const allMonitors = await this.monitorsRepo.findAll();
    const userMonitors = filterMonitorsByPermission(allMonitors, req.userRole!, req.permissions!);

    const monitorIds = userMonitors.map((m) => m.id);
    if (monitorIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Busquemos directamente usando una consulta a la base de datos de heartbeats para todos los IDs
    const limit = 30;
    const { Types } = require("mongoose");
    const { HeartbeatModel } = require("../../persistence/mongoose/schemas/heartbeat.schema");
    const objectIds = monitorIds.filter(id => Types.ObjectId.isValid(id)).map(id => new Types.ObjectId(id));
    
    const docs = await HeartbeatModel.find({ monitorId: { $in: objectIds } })
      .sort({ timestamp: -1 })
      .limit(limit);

    // Mapear resultado inyectando el nombre del monitor
    const monitorsMap = new Map(userMonitors.map(m => [m.id, m]));
    const result = docs.map((doc: any) => {
      const monitor = monitorsMap.get(String(doc.metaField || doc.monitorId));
      return {
        monitorId: String(doc.metaField || doc.monitorId),
        monitorName: monitor ? monitor.name : "Monitor Eliminado",
        target: monitor ? monitor.target : "",
        timestamp: doc.timestamp.toISOString(),
        status: doc.status === 1 || doc.status === "UP" ? "UP" : "DOWN",
        ping: doc.ping,
        msg: doc.msg,
      };
    });

    res.status(200).json(result);
  };
}
