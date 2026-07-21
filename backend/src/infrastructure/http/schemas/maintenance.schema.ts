// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

const scopeItemSchema = z
  .object({
    type: z.enum(["all", "group", "monitor"]),
    value: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "all" && (!data.value || data.value.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El alcance de tipo "${data.type}" requiere un valor (id de monitor o nombre de grupo)`,
        path: ["value"],
      });
    }
  });

const scopeSchema = z.array(scopeItemSchema).min(1, "Debe indicarse al menos un alcance");

export const createMaintenanceWindowSchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    scope: scopeSchema,
    mode: z.enum(["immediate", "scheduled"]),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "scheduled") {
      if (!data.startAt) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Falta la fecha de inicio", path: ["startAt"] });
      }
      if (!data.endAt) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Falta la fecha de fin", path: ["endAt"] });
      }
      if (data.startAt && data.endAt && data.endAt <= data.startAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de fin debe ser posterior a la fecha de inicio",
          path: ["endAt"],
        });
      }
    }
  });

export const updateMaintenanceWindowSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    scope: scopeSchema.optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startAt && data.endAt && data.endAt <= data.startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
        path: ["endAt"],
      });
    }
  });
