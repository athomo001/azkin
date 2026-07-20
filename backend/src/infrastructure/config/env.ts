// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Docker Compose sustituye una variable no definida en .env por una cadena vacía ("") en el
// contenedor, en vez de omitirla — por eso los campos opcionales con formato (email, hex, min
// length) deben tratar "" como "ausente" antes de validarse, o rechazan un valor que en la
// práctica significa "no configurado".
const emptyToUndefined = (val: unknown): unknown => (val === "" ? undefined : val);

const schema = z.object({
  AZKIN_PORT: z.coerce.number().int().positive().default(3000),
  AZKIN_MONGO_URI: z.string().min(1).default("mongodb://localhost:27017/azkin"),
  AZKIN_JWT_SECRET: z.string().min(1, "AZKIN_JWT_SECRET is required"),
  AZKIN_JWT_EXPIRES_IN: z.coerce.number().int().positive().default(7200),
  AZKIN_CHECK_CONCURRENCY: z.coerce.number().int().positive().default(50),
  AZKIN_FIRST_CHECK_DELAY_MS: z.coerce.number().int().nonnegative().default(1000),
  // Sin default permisivo — se exige configuración explícita (puede ser "*" a propósito
  // en desarrollo, pero debe ser una decisión consciente, no un fallback silencioso del código).
  AZKIN_CORS_ORIGIN: z.string().min(1, "AZKIN_CORS_ORIGIN es requerido (usa '*' solo si es intencional)"),
  // Costo de bcrypt configurable por entorno (ej. reducirlo en tests, subirlo en prod).
  AZKIN_BCRYPT_COST: z.coerce.number().int().min(4).max(15).default(10),
  // Credenciales de /metrics — sin fallback hardcodeado; si no están configuradas,
  // el endpoint queda inaccesible en vez de aceptar una contraseña conocida de antemano.
  AZKIN_PROMETHEUS_USER: z.preprocess(emptyToUndefined, z.string().optional()),
  AZKIN_PROMETHEUS_PASS: z.preprocess(emptyToUndefined, z.string().optional()),
  AZKIN_PROMETHEUS_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  // Variables del seeder: opcionales; si están presentes se crea el primer admin al arrancar
  AZKIN_FIRST_ADMIN_NAME: z.string().optional(),
  AZKIN_FIRST_ADMIN_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  AZKIN_FIRST_ADMIN_PASSWORD: z.preprocess(emptyToUndefined, z.string().min(8).optional()),
  // Clave de 32 bytes en hex (64 caracteres) para cifrar la clave privada TLS en reposo.
  AZKIN_TLS_ENCRYPTION_KEY: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "AZKIN_TLS_ENCRYPTION_KEY debe ser hexadecimal de 64 caracteres (32 bytes)")
      .optional(),
  ),
  // SMTP a nivel de aplicación para correos transaccionales (recuperación de contraseña).
  AZKIN_SMTP_HOST: z.string().optional(),
  AZKIN_SMTP_PORT: z.coerce.number().int().positive().default(587),
  AZKIN_SMTP_SECURE: z.coerce.boolean().default(false),
  AZKIN_SMTP_USER: z.string().optional(),
  AZKIN_SMTP_PASSWORD: z.string().optional(),
  AZKIN_SMTP_FROM: z.string().optional(),
  // URL pública del frontend, usada para construir el enlace de recuperación de contraseña.
  AZKIN_APP_URL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Fail-fast: sin configuración válida el proceso no arranca.
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export interface Env {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  checkConcurrency: number;
  firstCheckDelayMs: number;
  corsOrigin: string;
  bcryptCost: number;
  prometheusUser?: string;
  prometheusPass?: string;
  prometheusApiKey?: string;
  // Datos del primer administrador para el seeder automático al arrancar
  firstAdminName?: string;
  firstAdminEmail?: string;
  firstAdminPassword?: string;
  tlsEncryptionKey?: string;
  smtp: {
    host?: string;
    port: number;
    secure: boolean;
    user?: string;
    password?: string;
    from?: string;
  };
  appUrl?: string;
}

export const env: Env = {
  port: raw.AZKIN_PORT,
  mongoUri: raw.AZKIN_MONGO_URI,
  jwtSecret: raw.AZKIN_JWT_SECRET,
  jwtExpiresInSeconds: raw.AZKIN_JWT_EXPIRES_IN,
  checkConcurrency: raw.AZKIN_CHECK_CONCURRENCY,
  firstCheckDelayMs: raw.AZKIN_FIRST_CHECK_DELAY_MS,
  corsOrigin: raw.AZKIN_CORS_ORIGIN,
  bcryptCost: raw.AZKIN_BCRYPT_COST,
  prometheusUser: raw.AZKIN_PROMETHEUS_USER,
  prometheusPass: raw.AZKIN_PROMETHEUS_PASS,
  prometheusApiKey: raw.AZKIN_PROMETHEUS_API_KEY,
  firstAdminName: raw.AZKIN_FIRST_ADMIN_NAME,
  firstAdminEmail: raw.AZKIN_FIRST_ADMIN_EMAIL,
  firstAdminPassword: raw.AZKIN_FIRST_ADMIN_PASSWORD,
  tlsEncryptionKey: raw.AZKIN_TLS_ENCRYPTION_KEY,
  smtp: {
    host: raw.AZKIN_SMTP_HOST,
    port: raw.AZKIN_SMTP_PORT,
    secure: raw.AZKIN_SMTP_SECURE,
    user: raw.AZKIN_SMTP_USER,
    password: raw.AZKIN_SMTP_PASSWORD,
    from: raw.AZKIN_SMTP_FROM,
  },
  appUrl: raw.AZKIN_APP_URL,
};

// Advertencia de arranque para configuraciones explícitas pero permisivas —
// no bloquea el arranque (puede ser intencional en desarrollo), pero deja rastro visible.
if (env.corsOrigin === "*") {
  console.warn("[env] AZKIN_CORS_ORIGIN='*' permite cualquier origen. No usar en producción.");
}
if (!env.prometheusApiKey && !(env.prometheusUser && env.prometheusPass)) {
  console.warn("[env] /metrics quedará inaccesible: no hay AZKIN_PROMETHEUS_API_KEY ni AZKIN_PROMETHEUS_USER+PASS configurados.");
}
