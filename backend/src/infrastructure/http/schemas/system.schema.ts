// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

// `null` en cualquier campo significa "restablecer al valor de AZKIN_*_MS/SECONDS".
export const monitoringEngineSettingsSchema = z.object({
  degradedLatencyMs: z.number().int().positive().nullable(),
  acceleratedIntervalSeconds: z.number().int().positive().nullable(),
  flapThreshold: z.number().int().positive().nullable(),
  flapWindowSeconds: z.number().int().positive().nullable(),
});
