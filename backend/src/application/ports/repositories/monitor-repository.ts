import { IMonitor } from "../../../domain/entities/monitor";
import { MonitorType } from "../../../domain/value-objects/monitor-type";

export interface CreateMonitorData {
  userId: string;
  name: string;
  type: MonitorType;
  target: string;
  port?: number;
  interval: number;
  retries: number;
  retryInterval: number;
  group: string | null;
  tags: string[];
  notificationIds: string[];
  pushToken?: string;
  keyword?: string;
  keywordMethod?: "presence" | "absence";
  dnsResolver?: string;
  dnsRecordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
  
  // SNMP Fields
  snmpVersion?: "v1" | "v2c" | "v3";
  snmpCommunity?: string;
  snmpPort?: number;
  snmpOid?: string;
  snmpV3Username?: string;
  snmpV3AuthProtocol?: "md5" | "sha";
  snmpV3AuthKey?: string;
  snmpV3PrivProtocol?: "des" | "aes";
  snmpV3PrivKey?: string;

  headers?: Record<string, string>;
  userAgent?: string;
  ignoreTls?: boolean;
  integrityEnabled?: boolean;
  integrityProfile?: "static" | "dynamic";
  integrityIgnoredCssSelectors?: string[];
  integrityVisualMasks?: { x: number; y: number; width: number; height: number }[];
  integrityAllowedScripts?: string[];
  integrityThreshold?: number;
}

export interface UpdateMonitorData {
  name?: string;
  type?: MonitorType;
  target?: string;
  port?: number;
  interval?: number;
  retries?: number;
  retryInterval?: number;
  group?: string | null;
  tags?: string[];
  notificationIds?: string[];
  isActive?: boolean;
  pushToken?: string;
  keyword?: string;
  keywordMethod?: "presence" | "absence";
  dnsResolver?: string;
  dnsRecordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT";

  // SNMP Fields
  snmpVersion?: "v1" | "v2c" | "v3";
  snmpCommunity?: string;
  snmpPort?: number;
  snmpOid?: string;
  snmpV3Username?: string;
  snmpV3AuthProtocol?: "md5" | "sha";
  snmpV3AuthKey?: string;
  snmpV3PrivProtocol?: "des" | "aes";
  snmpV3PrivKey?: string;

  headers?: Record<string, string>;
  userAgent?: string;
  ignoreTls?: boolean;
  integrityEnabled?: boolean;
  integrityProfile?: "static" | "dynamic";
  integrityIgnoredCssSelectors?: string[];
  integrityVisualMasks?: { x: number; y: number; width: number; height: number }[];
  integrityAllowedScripts?: string[];
  integrityThreshold?: number;
}

export interface IMonitorRepository {
  create(data: CreateMonitorData): Promise<IMonitor>;
  findAllByUser(userId: string): Promise<IMonitor[]>;
  findById(userId: string, id: string): Promise<IMonitor | null>;
  update(userId: string, id: string, data: UpdateMonitorData): Promise<IMonitor | null>;
  delete(userId: string, id: string): Promise<boolean>;
  /** Contexto de sistema: monitores activos de todos los usuarios (bootstrap del scheduler). */
  findAllActive(): Promise<IMonitor[]>;
  distinctTags(userId: string): Promise<string[]>;
}
