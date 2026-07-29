// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import dotenv from "dotenv";
import { z } from "zod";
import { resolveTlsEncryptionKey } from "./resolve-tls-encryption-key";

dotenv.config();

// Docker Compose sustituye una variable no definida en .env por una cadena vacía ("") en el
// contenedor, en vez de omitirla — por eso los campos opcionales con formato (email, hex, min
// length) deben tratar "" como "ausente" antes de validarse, o rechazan un valor que en la
// práctica significa "no configurado".
const emptyToUndefined = (val: unknown): unknown => (val === "" ? undefined : val);

const schema = z.object({
  AZKIN_PORT: z.coerce.number().int().positive().default(3000),
  AZKIN_MONGO_URI: z.string().min(1).default("mongodb://localhost:27017/azkin"),
  AZKIN_JWT_SECRET: z
    .string()
    .min(32, "AZKIN_JWT_SECRET debe tener al menos 32 caracteres (ej. 'openssl rand -hex 32') — de él se deriva también la clave de cifrado en reposo de TLS/federación"),
  AZKIN_JWT_EXPIRES_IN: z.coerce.number().int().positive().default(7200),
  AZKIN_CHECK_CONCURRENCY: z.coerce.number().int().positive().default(50),
  AZKIN_FIRST_CHECK_DELAY_MS: z.coerce.number().int().nonnegative().default(1000),
  // Umbral de latencia (ms) sobre el cual un monitor HTTP que responde OK pasa a DEGRADED
  // en vez de UP, sin esperar a que falle por timeout.
  AZKIN_DEGRADED_LATENCY_MS: z.coerce.number().int().positive().default(5000),
  // Intervalo de chequeo (segundos) mientras un monitor está DOWN o DEGRADED — permite
  // registrar la curva de recuperación sin esperar el intervalo normal configurado.
  AZKIN_ACCELERATED_INTERVAL_SECONDS: z.coerce.number().int().positive().default(15),
  // Guarda anti-flapping (AZ-071): más de este número de transiciones UP/DOWN/DEGRADADO
  // confirmadas dentro de AZKIN_FLAP_WINDOW_SECONDS suprime nuevas alertas (el heartbeat sigue
  // guardándose) hasta que el monitor se estabiliza por una ventana completa. Pensado para
  // sitios detrás de un CDN/WAF (Cloudflare, Vercel) cuyo borde puede oscilar por ruido propio
  // sin que el origen real esté afectado.
  AZKIN_FLAP_THRESHOLD: z.coerce.number().int().positive().default(4),
  AZKIN_FLAP_WINDOW_SECONDS: z.coerce.number().int().positive().default(300),
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
  // Clave de 32 bytes en hex (64 caracteres) para cifrar la clave privada TLS en reposo. Opcional:
  // si se deja vacía, se deriva automáticamente de AZKIN_JWT_SECRET (ver resolve-tls-encryption-key.ts)
  // para que el cifrado en reposo funcione en cada nodo sin ningún paso manual. Fijarla solo si
  // se quiere una clave independiente del JWT secret. Sin restricción de formato aquí a propósito
  // (AZ-041): un valor explícito mal formado no debe poder tumbar el arranque completo del
  // backend — se valida por separado más abajo, con una advertencia en vez de `process.exit(1)`.
  AZKIN_TLS_ENCRYPTION_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
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

// AZ-041: validación no fatal de AZKIN_TLS_ENCRYPTION_KEY — ver resolve-tls-encryption-key.ts.
// Si no está configurada, se deriva de AZKIN_JWT_SECRET (siempre presente, ver schema arriba).
const { value: tlsEncryptionKey, warning: tlsEncryptionKeyWarning } = resolveTlsEncryptionKey(
  raw.AZKIN_TLS_ENCRYPTION_KEY,
  raw.AZKIN_JWT_SECRET,
);
if (tlsEncryptionKeyWarning) {
  console.warn(tlsEncryptionKeyWarning);
}

export interface Env {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  checkConcurrency: number;
  firstCheckDelayMs: number;
  degradedLatencyMs: number;
  acceleratedIntervalSeconds: number;
  flapThreshold: number;
  flapWindowSeconds: number;
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
  degradedLatencyMs: raw.AZKIN_DEGRADED_LATENCY_MS,
  acceleratedIntervalSeconds: raw.AZKIN_ACCELERATED_INTERVAL_SECONDS,
  flapThreshold: raw.AZKIN_FLAP_THRESHOLD,
  flapWindowSeconds: raw.AZKIN_FLAP_WINDOW_SECONDS,
  corsOrigin: raw.AZKIN_CORS_ORIGIN,
  bcryptCost: raw.AZKIN_BCRYPT_COST,
  prometheusUser: raw.AZKIN_PROMETHEUS_USER,
  prometheusPass: raw.AZKIN_PROMETHEUS_PASS,
  prometheusApiKey: raw.AZKIN_PROMETHEUS_API_KEY,
  firstAdminName: raw.AZKIN_FIRST_ADMIN_NAME,
  firstAdminEmail: raw.AZKIN_FIRST_ADMIN_EMAIL,
  firstAdminPassword: raw.AZKIN_FIRST_ADMIN_PASSWORD,
  tlsEncryptionKey,
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
if (env.bcryptCost < 10) {
  console.warn(`[env] AZKIN_BCRYPT_COST=${env.bcryptCost} está por debajo del mínimo recomendado (10) para producción — usar valores bajos solo para acelerar tests.`);
}
if (!(env.smtp.host && env.smtp.user && env.smtp.password)) {
  console.warn(
    "[env] AZKIN_SMTP_HOST/USER/PASSWORD incompletos: los correos (incluida la recuperación de contraseña) se registrarán en el log en vez de enviarse, salvo que configures un canal de notificación tipo Email como fuente de SMTP en /settings → Sistema.",
  );
}

// AZ-064: credenciales de ejemplo de .env.example son placeholders con forma de contraseña real
// (no un valor obviamente falso como "CHANGE_ME"), así que un despliegue que las copie sin
// cambiarlas no lo nota a simple vista. Se detectan por comparación literal contra los valores
// exactos documentados en .env.example/backend/.env.example y se advierte fuerte al arrancar.
const KNOWN_EXAMPLE_CREDENTIALS = {
  AZKIN_MONGO_PASSWORD: "CambiarEstaContrasenaDeMongoSegura123!",
  AZKIN_FIRST_ADMIN_PASSWORD: "CambiarEstaContrasenaSegura123!",
  AZKIN_PROMETHEUS_PASS: "PrometheusScraperSecurePass123!",
} as const;

const usedExampleCredentials: string[] = [];
// AZKIN_MONGO_PASSWORD no se recibe como variable propia en el backend (compose la interpola
// directo dentro de AZKIN_MONGO_URI) — se detecta buscando el valor de ejemplo dentro de la URI.
if (env.mongoUri.includes(KNOWN_EXAMPLE_CREDENTIALS.AZKIN_MONGO_PASSWORD)) {
  usedExampleCredentials.push("AZKIN_MONGO_PASSWORD");
}
if (env.firstAdminPassword === KNOWN_EXAMPLE_CREDENTIALS.AZKIN_FIRST_ADMIN_PASSWORD) {
  usedExampleCredentials.push("AZKIN_FIRST_ADMIN_PASSWORD");
}
if (env.prometheusPass === KNOWN_EXAMPLE_CREDENTIALS.AZKIN_PROMETHEUS_PASS) {
  usedExampleCredentials.push("AZKIN_PROMETHEUS_PASS");
}
if (usedExampleCredentials.length > 0) {
  console.warn("=".repeat(78));
  console.warn("[env] ¡ADVERTENCIA DE SEGURIDAD! Estás usando credenciales de EJEMPLO del repositorio");
  console.warn(`[env] público sin cambiar: ${usedExampleCredentials.join(", ")}.`);
  console.warn("[env] Cualquiera que haya visto este repo (es público) conoce estos valores. Cámbialos");
  console.warn("[env] antes de exponer esta instancia fuera de tu red local/de confianza.");
  console.warn("=".repeat(78));
}
