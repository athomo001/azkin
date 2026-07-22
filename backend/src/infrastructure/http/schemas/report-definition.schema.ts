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

const baseFields = {
  name: z.string().min(1).max(255),
  enabled: z.boolean(),
  frequency: z.enum(["daily", "weekly"]),
  scope: scopeSchema,
  hour: z.number().int().min(0).max(23),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  recipientMode: z.enum(["default_alert_email", "custom_list"]),
  recipientEmails: z.array(z.string().email()).default([]),
};

function validateWeeklyDayOfWeek<T extends { frequency?: "daily" | "weekly"; dayOfWeek?: number }>(
  data: T,
  ctx: z.RefinementCtx,
): void {
  if (data.frequency === "weekly" && data.dayOfWeek === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Los informes semanales requieren indicar el día de la semana",
      path: ["dayOfWeek"],
    });
  }
}

function validateCustomListRecipients<T extends { recipientMode?: "default_alert_email" | "custom_list"; recipientEmails?: string[] }>(
  data: T,
  ctx: z.RefinementCtx,
): void {
  if (data.recipientMode === "custom_list" && (!data.recipientEmails || data.recipientEmails.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El modo "Lista personalizada" requiere al menos un correo destinatario',
      path: ["recipientEmails"],
    });
  }
}

export const createReportDefinitionSchema = z.object(baseFields).superRefine((data, ctx) => {
  validateWeeklyDayOfWeek(data, ctx);
  validateCustomListRecipients(data, ctx);
});

export const updateReportDefinitionSchema = z
  .object({
    name: baseFields.name.optional(),
    enabled: baseFields.enabled.optional(),
    frequency: baseFields.frequency.optional(),
    scope: baseFields.scope.optional(),
    hour: baseFields.hour.optional(),
    dayOfWeek: baseFields.dayOfWeek,
    recipientMode: baseFields.recipientMode.optional(),
    recipientEmails: baseFields.recipientEmails.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.frequency === "weekly") validateWeeklyDayOfWeek(data, ctx);
    if (data.recipientMode === "custom_list") validateCustomListRecipients(data, ctx);
  });
