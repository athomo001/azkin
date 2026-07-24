// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Types } from "mongoose";
import {
  CreateFederatedHeartbeatData,
  FederatedHeartbeatSummary,
  IFederatedHeartbeatRepository,
} from "../../../../application/ports/repositories/federated-heartbeat-repository";
import { FederatedHeartbeatModel } from "../schemas/federated-heartbeat.schema";

export class MongooseFederatedHeartbeatRepository implements IFederatedHeartbeatRepository {
  async insertMany(data: CreateFederatedHeartbeatData[]): Promise<void> {
    if (data.length === 0) return;
    await FederatedHeartbeatModel.insertMany(
      data.map((d) => ({
        timestamp: d.timestamp,
        federatedMonitorLinkId: new Types.ObjectId(d.federatedMonitorLinkId),
        status: d.status,
        ping: d.ping,
      })),
    );
  }

  async findLatest(federatedMonitorLinkId: string): Promise<FederatedHeartbeatSummary | null> {
    if (!Types.ObjectId.isValid(federatedMonitorLinkId)) return null;
    const doc = await FederatedHeartbeatModel.findOne({
      federatedMonitorLinkId: new Types.ObjectId(federatedMonitorLinkId),
    }).sort({ timestamp: -1 });
    return doc ? { timestamp: doc.timestamp, status: doc.status, ping: doc.ping } : null;
  }

  async findHistory(federatedMonitorLinkId: string, limit = 20): Promise<FederatedHeartbeatSummary[]> {
    if (!Types.ObjectId.isValid(federatedMonitorLinkId)) return [];
    const docs = await FederatedHeartbeatModel.find({
      federatedMonitorLinkId: new Types.ObjectId(federatedMonitorLinkId),
    })
      .sort({ timestamp: -1 })
      .limit(limit);
    return docs.map((doc) => ({ timestamp: doc.timestamp, status: doc.status, ping: doc.ping })).reverse();
  }
}
