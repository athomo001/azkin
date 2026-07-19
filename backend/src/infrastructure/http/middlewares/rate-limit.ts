// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import rateLimit from "express-rate-limit";

/**
 * Limitador de fuerza bruta para los endpoints de autenticación (AZ-010).
 * En memoria (single-instance); si el despliegue escala a múltiples réplicas del backend,
 * migrar a un store compartido (ej. Redis) para que el límite sea efectivo entre instancias.
 */
export function makeAuthRateLimiter(maxAttempts: number, windowMinutes: number) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: maxAttempts,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMITED", message: "Demasiados intentos. Intenta de nuevo más tarde." } },
  });
}
