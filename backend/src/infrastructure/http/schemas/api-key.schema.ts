// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(["read", "write"])).min(1).default(["read"]),
});
