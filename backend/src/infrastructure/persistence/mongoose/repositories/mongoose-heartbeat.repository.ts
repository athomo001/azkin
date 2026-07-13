import { Types } from "mongoose";
import {
  HeartbeatSummary,
  IHeartbeatRepository,
} from "../../../../application/ports/repositories/heartbeat-repository";
import { IHeartbeat } from "../../../../domain/entities/heartbeat";
import { MonitorStatus } from "../../../../domain/value-objects/monitor-status";
import { HeartbeatModel } from "../schemas/heartbeat.schema";

const DAY_MS = 24 * 60 * 60 * 1000;

interface SummaryAggRow {
  _id: Types.ObjectId;
  total: number;
  ups: number;
  lastStatus: number;
  lastPing: number | null;
}

export class MongooseHeartbeatRepository implements IHeartbeatRepository {
  async save(beat: IHeartbeat): Promise<void> {
    await HeartbeatModel.create({
      timestamp: beat.timestamp,
      monitorId: new Types.ObjectId(beat.monitorId),
      status: beat.status,
      ping: beat.ping,
      msg: beat.msg,
    });
  }

  async findLast24h(monitorId: string): Promise<IHeartbeat[]> {
    if (!Types.ObjectId.isValid(monitorId)) return [];
    const since = new Date(Date.now() - DAY_MS);
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
    }));
  }

  async deleteByMonitor(monitorId: string): Promise<void> {
    if (!Types.ObjectId.isValid(monitorId)) return;
    await HeartbeatModel.deleteMany({ monitorId: new Types.ObjectId(monitorId) });
  }

  async getSummaries(monitorIds: string[]): Promise<Record<string, HeartbeatSummary>> {
    const objectIds = monitorIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    if (objectIds.length === 0) return {};

    const since = new Date(Date.now() - DAY_MS);
    const rows = await HeartbeatModel.aggregate<SummaryAggRow>([
      { $match: { monitorId: { $in: objectIds }, timestamp: { $gte: since } } },
      { $sort: { timestamp: 1 } },
      {
        $group: {
          _id: "$monitorId",
          total: { $sum: 1 },
          ups: { $sum: { $cond: [{ $eq: ["$status", MonitorStatus.UP] }, 1, 0] } },
          lastStatus: { $last: "$status" },
          lastPing: { $last: "$ping" },
        },
      },
    ]);

    const result: Record<string, HeartbeatSummary> = {};
    for (const row of rows) {
      result[String(row._id)] = {
        lastStatus: row.lastStatus as MonitorStatus,
        lastPing: row.lastPing ?? null,
        uptime24h: row.total === 0 ? null : row.ups / row.total,
      };
    }
    return result;
  }
}
