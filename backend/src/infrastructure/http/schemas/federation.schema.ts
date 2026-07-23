// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const joinFederationSchema = z.object({
  code: z.string().min(1, "Falta el código de enrollment"),
  peerLabel: z.string().min(1).max(100),
  ownLabel: z.string().min(1).max(100),
});

// Llamada por el backend de la instancia remota (sin sesión) — validar con la misma exigencia
// que un endpoint público, ya que el único filtro de autorización es el token en el body.
export const acceptEnrollmentSchema = z.object({
  token: z.string().min(1),
  callerLabel: z.string().min(1).max(100),
  callerUrl: z.string().url(),
  callerSecret: z.string().min(1),
});

export const createFederatedMonitorLinkSchema = z.object({
  localMonitorId: z.string().min(1),
  federatedInstanceId: z.string().min(1),
  remoteMonitorId: z.string().min(1),
  remoteMonitorLabel: z.string().min(1).max(255),
});

// Sin `.url()` a propósito: acepta IP o dominio simple, sin exigir esquema — se normaliza en
// `SetFederationOwnUrlUseCase` (ver normalize-instance-url.ts), no acá.
export const setFederationOwnUrlSchema = z.object({
  ownUrl: z.string().min(1, "Indica una dirección o URL"),
});

export const testAddressConnectionSchema = z.object({
  host: z.string().min(1, "Indica una dirección o URL"),
  port: z.coerce.number().int().min(1).max(65535),
});
