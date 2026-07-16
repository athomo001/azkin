import { Types } from "mongoose";
import {
  HeartbeatSummary,
  IHeartbeatRepository,
} from "../../../../application/ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../../domain/value-objects/monitor-status";
import { HeartbeatModel } from "../schemas/heartbeat.schema";

const DAY_MS = 24 * 60 * 60 * 1000;



export class MongooseHeartbeatRepository implements IHeartbeatRepository {
  async save(beat: IHeartbeat): Promise<void> {
    await HeartbeatModel.create({
      timestamp: beat.timestamp,
      monitorId: new Types.ObjectId(beat.monitorId),
      status: beat.status,
      ping: beat.ping,
      msg: beat.msg,
      certExpiry: beat.certExpiry,
      domainExpiry: beat.domainExpiry,
      isLocalNetworkDown: beat.isLocalNetworkDown ?? false,
    });
  }

  async findLast24h(monitorId: string): Promise<IHeartbeat[]> {
    return this.findHistory(monitorId, DAY_MS);
  }

  async findHistory(monitorId: string, durationMs: number): Promise<IHeartbeat[]> {
    if (!Types.ObjectId.isValid(monitorId)) return [];
    const safeDurationMs = Math.max(0, durationMs);
    const since = new Date(Date.now() - safeDurationMs);
    const docs = await HeartbeatModel.find({
      monitorId: new Types.ObjectId(monitorId),
      timestamp: { $gte: since },
    }).sort({ timestamp: 1 });

    return docs.map((doc) => ({
      monitorId,
      timestamp: doc.timestamp,
      status: doc.status as MonitorStatus,
      ping: doc.ping ?? null,
      msg: doc.msg ?? null,
      certExpiry: doc.certExpiry ?? null,
      domainExpiry: doc.domainExpiry ?? null,
      isLocalNetworkDown: doc.isLocalNetworkDown ?? false,
    }));
  }

  async deleteByMonitor(monitorId: string): Promise<void> {
    if (!Types.ObjectId.isValid(monitorId)) return;
    await HeartbeatModel.deleteMany({ monitorId: new Types.ObjectId(monitorId) });
  }

  async getSummaries(monitorIds: string[]): Promise<Record<string, HeartbeatSummary>> {
    const result: Record<string, HeartbeatSummary> = {};
    const since = new Date(Date.now() - DAY_MS);

    for (const id of monitorIds) {
      if (!Types.ObjectId.isValid(id)) continue;
      const mId = new Types.ObjectId(id);

      // 1. Obtener el último heartbeat absoluto de toda la historia
      const lastBeat = await HeartbeatModel.findOne({ monitorId: mId }).sort({ timestamp: -1 });

      // 2. Obtener agregados de las últimas 24h para el cálculo del uptime porcentual
      const stats = await HeartbeatModel.aggregate([
        { $match: { monitorId: mId, timestamp: { $gte: since } } },
        {
          $group: {
            _id: "$monitorId",
            total: { $sum: 1 },
            ups: { $sum: { $cond: [{ $eq: ["$status", MonitorStatus.UP] }, 1, 0] } }
          }
        }
      ]);

      if (lastBeat) {
        const row24 = stats[0] || { total: 0, ups: 0 };
        const isUp = lastBeat.status === MonitorStatus.UP;
        result[id] = {
          lastStatus: lastBeat.status as MonitorStatus,
          lastPing: lastBeat.ping ?? null,
          uptime24h: row24.total === 0 ? 1.0 : row24.ups / row24.total,
          lastErrorMsg: !isUp ? (lastBeat.msg ?? null) : null,
          certExpiry: lastBeat.certExpiry ?? null,
          domainExpiry: lastBeat.domainExpiry ?? null,
          isLocalNetworkDown: (lastBeat as any).isLocalNetworkDown ?? false,
        };
      } else {
        result[id] = {
          lastStatus: MonitorStatus.PENDING,
          lastPing: null,
          uptime24h: null,
          lastErrorMsg: null,
          certExpiry: null,
          domainExpiry: null,
          isLocalNetworkDown: false,
        };
      }
    }
    return result;
  }
}
