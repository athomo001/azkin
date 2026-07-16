import { z } from "zod";

// Patrón para verificar un ObjectId de Mongoose válido
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Debe ser un ObjectId de Mongoose válido",
});

// ==========================================
// 1. Esquemas de Autenticación y Cuentas
// ==========================================

export const RegisterSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido").toLowerCase().trim(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const LoginSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido").toLowerCase().trim(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const UpdatePreferencesSchema = z.object({
  nyanCatMode: z.boolean({ required_error: "nyanCatMode es obligatorio" }),
});

// ==========================================
// 2. Esquemas de Canales de Notificación
// ==========================================

export const CreateNotificationSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres").trim(),
  type: z.enum(["email", "slack", "telegram", "discord", "webhook"], {
    errorMap: () => ({ message: "Tipo de notificación inválido" }),
  }),
  config: z.record(z.unknown(), { required_error: "La configuración es obligatoria" }),
  isActive: z.boolean().optional().default(true),
});

export const UpdateNotificationSchema = CreateNotificationSchema.partial();

// ==========================================
// 3. Esquemas de Gestión de Viewers (Usuarios)
// ==========================================

const PermissionItemSchema = z.object({
  type: z.enum(["all", "group", "monitor"], {
    errorMap: () => ({ message: "Tipo de permiso inválido" }),
  }),
  value: z.string().optional(),
});

export const CreateViewerSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido").toLowerCase().trim(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  permissions: z.array(PermissionItemSchema).optional().default([]),
  isTvSessionEnabled: z.boolean().optional().default(false),
});

export const UpdatePermissionsSchema = z.object({
  permissions: z.array(PermissionItemSchema),
  isTvSessionEnabled: z.boolean().optional(),
});

// ==========================================
// 4. Esquemas de Monitores (Core)
// ==========================================

const VisualMaskSchema = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const BaseMonitorSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255, "Máximo 255 caracteres").trim(),
  type: z.enum(["http", "ping", "port", "dns", "push"], {
    errorMap: () => ({ message: "Tipo de monitoreo inválido" }),
  }),
  target: z.string().max(512, "Máximo 512 caracteres").trim().optional(),
  port: z
    .number()
    .int()
    .min(1, "Puerto mínimo 1")
    .max(65535, "Puerto máximo 65535")
    .optional(),
  interval: z.number().int().min(20, "El intervalo mínimo es de 20 segundos"),
  retries: z.number().int().nonnegative().optional().default(0),
  retryInterval: z.number().int().min(20, "El intervalo de reintento mínimo es de 20 segundos").optional().default(60),
  group: z.string().max(100, "El nombre del grupo es demasiado largo").trim().nullable().optional().default(null),
  tags: z
    .array(z.string().max(50, "Cada etiqueta puede tener máximo 50 caracteres").trim())
    .max(10, "Máximo 10 etiquetas por monitor")
    .optional()
    .default([]),
  notificationIds: z.array(objectIdSchema).optional().default([]),
  
  // Parámetros específicos adicionales
  keyword: z.string().trim().optional(),
  keywordMethod: z.enum(["presence", "absence"]).optional().default("presence"),
  dnsResolver: z.string().trim().optional(),
  dnsRecordType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT"]).optional().default("A"),
  
  // Soporte Cloudflare / Red Avanzado
  headers: z.record(z.string()).optional(),
  userAgent: z.string().optional(),
  ignoreTls: z.boolean().optional().default(false),
  
  // Módulo de Integridad Visual y Estructural
  integrityEnabled: z.boolean().optional().default(false),
  integrityProfile: z.enum(["static", "dynamic"]).optional().default("static"),
  integrityIgnoredCssSelectors: z.array(z.string()).optional().default([]),
  integrityVisualMasks: z.array(VisualMaskSchema).optional().default([]),
  integrityAllowedScripts: z.array(z.string()).optional().default([]),
  integrityThreshold: z.number().min(0).max(1).optional().default(0.10),
});

export const CreateMonitorSchema = BaseMonitorSchema
  .refine(
    (data) => {
      // Si el tipo no es push, target es obligatorio
      if (data.type !== "push" && (!data.target || data.target.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "El target es obligatorio para tipos de monitoreo activos",
      path: ["target"],
    },
  )
  .refine(
    (data) => {
      // Si el tipo es port, port es obligatorio
      if (data.type === "port" && data.port === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "El puerto es obligatorio cuando el tipo de monitor es 'port'",
      path: ["port"],
    },
  )
  .refine(
    (data) => {
      // Si el tipo es http, target debe ser un formato de URL válido
      if (data.type === "http" && data.target) {
        try {
          const urlStr = data.target.startsWith("http://") || data.target.startsWith("https://")
            ? data.target
            : `http://${data.target}`;
          new URL(urlStr);
          return true;
        } catch (_) {
          return false;
        }
      }
      return true;
    },
    {
      message: "El target debe ser una URL válida para monitores HTTP",
      path: ["target"],
    },
  );

export const UpdateMonitorSchema = BaseMonitorSchema.partial();
