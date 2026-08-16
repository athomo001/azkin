// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const updateThemeModeSettingsSchema = z.object({
  disabledModeIds: z.array(z.string()),
});
