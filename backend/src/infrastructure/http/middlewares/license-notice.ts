// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { NextFunction, Request, Response } from "express";

/**
 * Adjunta los términos de licenciamiento (SSPL v1 + licencia comercial) a toda respuesta de la
 * API, incluida la API pública (`/api/public/v1/*`). No reemplaza el texto legal de LICENSE.md —
 * es un aviso informativo para quien consuma la API vía HTTP directamente.
 */
export function licenseNotice(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-License", "SSPL-1.0");
  res.setHeader(
    "X-License-Notice",
    'Azkin esta licenciado bajo SSPL v1. Ofrecer esta API o su funcionalidad a terceros como ' +
      'un servicio comercial requiere una Licencia Comercial (contacto: espinozathan@gmail.com). ' +
      'Ver LICENSE.md.'
  );
  next();
}
