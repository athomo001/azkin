// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
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
  sameHostAsAzkin?: boolean;
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
  sameHostAsAzkin?: boolean;
  integrityEnabled?: boolean;
  integrityProfile?: "static" | "dynamic";
  integrityIgnoredCssSelectors?: string[];
  integrityVisualMasks?: { x: number; y: number; width: number; height: number }[];
  integrityAllowedScripts?: string[];
  integrityThreshold?: number;
}

/**
 * Sin aislamiento por tenant entre Admins (spec/03-modelo-datos.md §8): todos los monitores
 * son un único pool global. `userId` en el documento es solo trazabilidad de creación.
 */
export interface IMonitorRepository {
  create(data: CreateMonitorData): Promise<IMonitor>;
  /** Todos los monitores del sistema (pool global, sin filtro de propietario). */
  findAll(): Promise<IMonitor[]>;
  findById(id: string): Promise<IMonitor | null>;
  update(id: string, data: UpdateMonitorData): Promise<IMonitor | null>;
  delete(id: string): Promise<boolean>;
  /** Borra múltiples monitores. Devuelve la cantidad realmente eliminada. */
  deleteMany(ids: string[]): Promise<number>;
  /** Contexto de sistema: monitores activos de todos los usuarios (bootstrap del scheduler). */
  findAllActive(): Promise<IMonitor[]>;
  distinctTags(): Promise<string[]>;
}
