// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const createMonitorSchema = z
  .object({
    name: z.string().min(1).max(255),
    type: z.enum(["http", "ping", "port", "dns", "push", "snmp"]),
    target: z.string().min(1).max(512).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    interval: z.number().int().min(20),
    retries: z.number().int().min(0).default(0),
    retryInterval: z.number().int().min(20).default(60),
    group: z.string().max(100).nullable().optional(),
    tags: z.array(z.string().max(50)).max(10).default([]),
    notificationIds: z.array(z.string()).optional(),
    
    // Configuración avanzada / HTTP / Cloudflare
    headers: z.record(z.string()).optional(),
    userAgent: z.string().optional(),
    ignoreTls: z.boolean().optional(),
    sameHostAsAzkin: z.boolean().optional(),
    
    // Opciones específicas
    keyword: z.string().optional(),
    keywordMethod: z.enum(["presence", "absence"]).optional(),
    dnsResolver: z.string().optional(),
    dnsRecordType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT"]).optional(),

    // SNMP Specific
    snmpVersion: z.enum(["v1", "v2c", "v3"]).optional(),
    snmpCommunity: z.string().optional(),
    snmpPort: z.number().int().min(1).max(65535).optional(),
    snmpOid: z.string().optional(),
    snmpV3Username: z.string().optional(),
    snmpV3AuthProtocol: z.enum(["md5", "sha"]).optional(),
    snmpV3AuthKey: z.string().optional(),
    snmpV3PrivProtocol: z.enum(["des", "aes"]).optional(),
    snmpV3PrivKey: z.string().optional(),

    // Detección de Defacement / Integridad
    integrityEnabled: z.boolean().optional(),
    integrityProfile: z.enum(["static", "dynamic"]).optional(),
    integrityIgnoredCssSelectors: z.array(z.string()).optional(),
    integrityVisualMasks: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
      )
      .optional(),
    integrityAllowedScripts: z.array(z.string()).optional(),
    integrityThreshold: z.number().min(0).max(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "push" && !data.target) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "target is required when type is not 'push'",
        path: ["target"],
      });
    }
    if (data.type === "port" && data.port === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "port is required when type is 'port'",
        path: ["port"],
      });
    }
    if (data.type === "http" && data.target && !isHttpUrl(data.target)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "target must be a valid http(s) URL when type is 'http'",
        path: ["target"],
      });
    }
  });

export const updateMonitorSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    type: z.enum(["http", "ping", "port", "dns", "push", "snmp"]).optional(),
    target: z.string().min(1).max(512).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    interval: z.number().int().min(20).optional(),
    retries: z.number().int().min(0).optional(),
    retryInterval: z.number().int().min(20).optional(),
    group: z.string().max(100).nullable().optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    isActive: z.boolean().optional(),
    notificationIds: z.array(z.string()).optional(),

    headers: z.record(z.string()).optional(),
    userAgent: z.string().optional(),
    ignoreTls: z.boolean().optional(),
    sameHostAsAzkin: z.boolean().optional(),

    keyword: z.string().optional(),
    keywordMethod: z.enum(["presence", "absence"]).optional(),
    dnsResolver: z.string().optional(),
    dnsRecordType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT"]).optional(),

    // SNMP Specific
    snmpVersion: z.enum(["v1", "v2c", "v3"]).optional(),
    snmpCommunity: z.string().optional(),
    snmpPort: z.number().int().min(1).max(65535).optional(),
    snmpOid: z.string().optional(),
    snmpV3Username: z.string().optional(),
    snmpV3AuthProtocol: z.enum(["md5", "sha"]).optional(),
    snmpV3AuthKey: z.string().optional(),
    snmpV3PrivProtocol: z.enum(["des", "aes"]).optional(),
    snmpV3PrivKey: z.string().optional(),

    integrityEnabled: z.boolean().optional(),
    integrityProfile: z.enum(["static", "dynamic"]).optional(),
    integrityIgnoredCssSelectors: z.array(z.string()).optional(),
    integrityVisualMasks: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
      )
      .optional(),
    integrityAllowedScripts: z.array(z.string()).optional(),
    integrityThreshold: z.number().min(0).max(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field is required",
  });
