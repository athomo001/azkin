// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const createViewerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(8),
  permissions: z
    .array(
      z.object({
        type: z.enum(["all", "group", "monitor"]),
        value: z.string().optional(),
      })
    )
    .optional(),
  isTvSessionEnabled: z.boolean().optional(),
});

export const createAdminSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(8),
});

export const updateViewerPermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      type: z.enum(["all", "group", "monitor"]),
      value: z.string().optional(),
    })
  ),
  isTvSessionEnabled: z.boolean().optional(),
});
