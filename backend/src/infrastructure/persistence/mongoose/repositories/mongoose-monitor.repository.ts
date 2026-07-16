import { HydratedDocument, Types } from "mongoose";
import {
  CreateMonitorData,
  IMonitorRepository,
  UpdateMonitorData,
} from "../../../../application/ports/repositories/monitor-repository";
import { IMonitor } from "../../../../domain/entities/monitor";
import { MonitorDoc, MonitorModel } from "../schemas/monitor.schema";

export class MongooseMonitorRepository implements IMonitorRepository {
  async create(data: CreateMonitorData): Promise<IMonitor> {
    const doc = await MonitorModel.create({
      userId: new Types.ObjectId(data.userId),
      name: data.name,
      type: data.type,
      target: data.target,
      port: data.port,
      interval: data.interval,
      retries: data.retries,
      retryInterval: data.retryInterval,
      group: data.group,
      tags: data.tags,
      isActive: true,
      notificationIds: (data.notificationIds ?? []).map((nid) => new Types.ObjectId(nid)),
      pushToken: data.pushToken,
      keyword: data.keyword,
      keywordMethod: data.keywordMethod,
      dnsResolver: data.dnsResolver,
      dnsRecordType: data.dnsRecordType,
      
      // SNMP fields mapping
      snmpVersion: data.snmpVersion,
      snmpCommunity: data.snmpCommunity,
      snmpPort: data.snmpPort,
      snmpOid: data.snmpOid,
      snmpV3Username: data.snmpV3Username,
      snmpV3AuthProtocol: data.snmpV3AuthProtocol,
      snmpV3AuthKey: data.snmpV3AuthKey,
      snmpV3PrivProtocol: data.snmpV3PrivProtocol,
      snmpV3PrivKey: data.snmpV3PrivKey,

      headers: data.headers ? new Map(Object.entries(data.headers)) : new Map(),
      userAgent: data.userAgent,
      ignoreTls: data.ignoreTls,
      integrityEnabled: data.integrityEnabled,
      integrityProfile: data.integrityProfile,
      integrityIgnoredCssSelectors: data.integrityIgnoredCssSelectors,
      integrityVisualMasks: data.integrityVisualMasks,
      integrityAllowedScripts: data.integrityAllowedScripts,
      integrityThreshold: data.integrityThreshold,
    });
    return this.toDomain(doc);
  }

  async findAllByUser(userId: string): Promise<IMonitor[]> {
    const docs = await MonitorModel.find({ userId });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(userId: string, id: string): Promise<IMonitor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await MonitorModel.findOne({ _id: id, userId });
    return doc ? this.toDomain(doc) : null;
  }

  async update(userId: string, id: string, data: UpdateMonitorData): Promise<IMonitor | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updateObj: any = { ...data };
    if (data.notificationIds) {
      updateObj.notificationIds = data.notificationIds.map((nid) => new Types.ObjectId(nid));
    }
    if (data.headers) {
      updateObj.headers = new Map(Object.entries(data.headers));
    }

    const doc = await MonitorModel.findOneAndUpdate({ _id: id, userId }, updateObj, { new: true });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await MonitorModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async findAllActive(): Promise<IMonitor[]> {
    const docs = await MonitorModel.find({ isActive: true });
    return docs.map((doc) => this.toDomain(doc));
  }

  async distinctTags(userId: string): Promise<string[]> {
    const tags = await MonitorModel.distinct("tags", { userId });
    return tags;
  }

  private toDomain(doc: HydratedDocument<MonitorDoc>): IMonitor {
    return {
      id: String(doc._id),
      userId: String(doc.userId),
      name: doc.name,
      type: doc.type,
      target: doc.target,
      port: doc.port,
      interval: doc.interval,
      retries: doc.retries,
      retryInterval: doc.retryInterval,
      group: doc.group,
      tags: doc.tags,
      isActive: doc.isActive,
      notificationIds: (doc.notificationIds ?? []).map((id) => String(id)),
      headers: doc.headers ? Object.fromEntries(doc.headers) : {},
      userAgent: doc.userAgent,
      ignoreTls: doc.ignoreTls,
      integrityEnabled: doc.integrityEnabled,
      integrityProfile: doc.integrityProfile,
      integrityIgnoredCssSelectors: doc.integrityIgnoredCssSelectors,
      integrityVisualMasks: (doc.integrityVisualMasks ?? []).map((m) => ({
        x: m.x,
        y: m.y,
        width: m.width,
        height: m.height,
      })),
      integrityAllowedScripts: doc.integrityAllowedScripts,
      integrityThreshold: doc.integrityThreshold,
      pushToken: doc.pushToken,
      keyword: doc.keyword,
      keywordMethod: doc.keywordMethod,
      dnsResolver: doc.dnsResolver,
      dnsRecordType: doc.dnsRecordType,
      
      // SNMP domain fields
      snmpVersion: doc.snmpVersion,
      snmpCommunity: doc.snmpCommunity,
      snmpPort: doc.snmpPort,
      snmpOid: doc.snmpOid,
      snmpV3Username: doc.snmpV3Username,
      snmpV3AuthProtocol: doc.snmpV3AuthProtocol as any,
      snmpV3AuthKey: doc.snmpV3AuthKey,
      snmpV3PrivProtocol: doc.snmpV3PrivProtocol as any,
      snmpV3PrivKey: doc.snmpV3PrivKey,

      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
