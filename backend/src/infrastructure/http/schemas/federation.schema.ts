// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const createEnrollmentTokenSchema = z.object({
  ownUrl: z.string().url("Debe ser una URL válida, ej. https://mi-azkin.miempresa.cl"),
});

export const joinFederationSchema = z.object({
  code: z.string().min(1, "Falta el código de enrollment"),
  peerLabel: z.string().min(1).max(100),
  ownLabel: z.string().min(1).max(100),
  ownUrl: z.string().url("Debe ser una URL válida, ej. https://mi-azkin.miempresa.cl"),
});

// Llamada por el backend de la instancia remota (sin sesión) — validar con la misma exigencia
// que un endpoint público, ya que el único filtro de autorización es el token en el body.
export const acceptEnrollmentSchema = z.object({
  token: z.string().min(1),
  callerCertPem: z.string().min(1),
  callerLabel: z.string().min(1).max(100),
  callerUrl: z.string().url(),
});
