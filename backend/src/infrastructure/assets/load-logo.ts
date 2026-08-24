// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import fs from "fs";
import path from "path";

let cachedLogo: Buffer | undefined;

/**
 * Carga (y cachea en memoria) el logo de Azkin usado como imagen inline (`cid`) en correos
 * transaccionales HTML. Vive en infraestructura porque la capa de aplicación no debe conocer
 * rutas de archivo físicas — se inyecta como Buffer vía composition-root.
 */
export function loadAzkinLogo(): Buffer {
  if (!cachedLogo) {
    cachedLogo = fs.readFileSync(path.join(__dirname, "logo-azkin.png"));
  }
  return cachedLogo;
}
