// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  IMonitoringEngineSettingsRepository,
  UpsertMonitoringEngineSettingsData,
} from "../../../../application/ports/repositories/monitoring-engine-settings-repository";
import { IMonitoringEngineSettings } from "../../../../domain/entities/monitoring-engine-settings";
import {
  MONITORING_ENGINE_SETTINGS_SINGLETON_ID,
  MonitoringEngineSettingsDoc,
  MonitoringEngineSettingsModel,
} from "../schemas/monitoring-engine-settings.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseMonitoringEngineSettingsRepository implements IMonitoringEngineSettingsRepository {
  async getActive(): Promise<IMonitoringEngineSettings | null> {
    const doc = await MonitoringEngineSettingsModel.findById(MONITORING_ENGINE_SETTINGS_SINGLETON_ID);
    return doc ? this.toDomain(doc) : null;
  }

  async upsert(data: UpsertMonitoringEngineSettingsData): Promise<IMonitoringEngineSettings> {
    const doc = await MonitoringEngineSettingsModel.findByIdAndUpdate(
      MONITORING_ENGINE_SETTINGS_SINGLETON_ID,
      {
        degradedLatencyMs: data.degradedLatencyMs,
        acceleratedIntervalSeconds: data.acceleratedIntervalSeconds,
        updatedById: new Types.ObjectId(data.updatedById),
      },
      { new: true, upsert: true },
    );
    return this.toDomain(doc!);
  }

  private toDomain(doc: HydratedDocument<MonitoringEngineSettingsDoc>): IMonitoringEngineSettings {
    return {
      id: toDomainId(doc._id),
      degradedLatencyMs: doc.degradedLatencyMs ?? null,
      acceleratedIntervalSeconds: doc.acceleratedIntervalSeconds ?? null,
      updatedAt: doc.updatedAt,
      updatedById: String(doc.updatedById),
    };
  }
}
