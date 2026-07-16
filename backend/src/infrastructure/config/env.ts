import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  AZKIN_PORT: z.coerce.number().int().positive().default(3000),
  AZKIN_MONGO_URI: z.string().min(1).default("mongodb://localhost:27017/azkin"),
  AZKIN_JWT_SECRET: z.string().min(1, "AZKIN_JWT_SECRET is required"),
  AZKIN_JWT_EXPIRES_IN: z.coerce.number().int().positive().default(7200),
  AZKIN_CHECK_CONCURRENCY: z.coerce.number().int().positive().default(50),
  AZKIN_FIRST_CHECK_DELAY_MS: z.coerce.number().int().nonnegative().default(1000),
  AZKIN_CORS_ORIGIN: z.string().default("*"),
  // Variables del seeder: opcionales; si están presentes se crea el primer admin al arrancar
  AZKIN_FIRST_ADMIN_NAME: z.string().optional(),
  AZKIN_FIRST_ADMIN_EMAIL: z.string().email().optional(),
  AZKIN_FIRST_ADMIN_PASSWORD: z.string().min(8).optional(),
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
  // Datos del primer administrador para el seeder automático al arrancar
  firstAdminName?: string;
  firstAdminEmail?: string;
  firstAdminPassword?: string;
}

export const env: Env = {
  port: raw.AZKIN_PORT,
  mongoUri: raw.AZKIN_MONGO_URI,
  jwtSecret: raw.AZKIN_JWT_SECRET,
  jwtExpiresInSeconds: raw.AZKIN_JWT_EXPIRES_IN,
  checkConcurrency: raw.AZKIN_CHECK_CONCURRENCY,
  firstCheckDelayMs: raw.AZKIN_FIRST_CHECK_DELAY_MS,
  corsOrigin: raw.AZKIN_CORS_ORIGIN,
  firstAdminName: raw.AZKIN_FIRST_ADMIN_NAME,
  firstAdminEmail: raw.AZKIN_FIRST_ADMIN_EMAIL,
  firstAdminPassword: raw.AZKIN_FIRST_ADMIN_PASSWORD,
};
