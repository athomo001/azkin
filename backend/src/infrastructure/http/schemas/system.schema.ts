// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const applyTlsConfigSchema = z.object({
  certPem: z.string().min(1, "El certificado (PEM) es requerido"),
  keyPem: z.string().min(1, "La clave privada (PEM) es requerida"),
  chainPem: z.string().optional(),
  port: z.coerce.number().int().min(1).max(65535),
  httpRedirect: z.boolean().optional().default(false),
});
