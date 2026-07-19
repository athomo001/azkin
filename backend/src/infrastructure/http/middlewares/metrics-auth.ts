// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { Env } from "../../config/env";

/** Compara dos strings en tiempo constante, sin filtrar longitud vía early-exit del `===`. */
function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Igual costo que una comparación real, para no filtrar la longitud por temporización.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Middleware de autenticación para `/metrics` (AZ-010/AZ-013).
 * Sin credenciales por defecto hardcodeadas: si no hay `AZKIN_PROMETHEUS_API_KEY` ni
 * `AZKIN_PROMETHEUS_USER`+`PASS` configurados, el endpoint queda inaccesible (401 siempre).
 * La API Key solo se acepta por header (nunca por query string, para no quedar en logs de acceso).
 */
export function makeMetricsAuth(env: Env) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const apiKeyHeader = req.headers["x-api-key"];
    const providedKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

    let authorized = false;

    if (env.prometheusApiKey) {
      if (providedKey && timingSafeEqualString(providedKey, env.prometheusApiKey)) {
        authorized = true;
      }
    } else if (env.prometheusUser && env.prometheusPass) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Basic ")) {
        const decoded = Buffer.from(authHeader.slice("Basic ".length), "base64").toString("utf-8");
        const separatorIdx = decoded.indexOf(":");
        const user = separatorIdx >= 0 ? decoded.slice(0, separatorIdx) : decoded;
        const pass = separatorIdx >= 0 ? decoded.slice(separatorIdx + 1) : "";
        if (timingSafeEqualString(user, env.prometheusUser) && timingSafeEqualString(pass, env.prometheusPass)) {
          authorized = true;
        }
      }
    }
    // Si no hay ninguna credencial configurada en env, `authorized` permanece false: el
    // endpoint no es accesible con ningún valor conocido de antemano en el código fuente.

    if (!authorized) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Azkin Metrics"');
      res.status(401).send("Unauthorized");
      return;
    }

    next();
  };
}
