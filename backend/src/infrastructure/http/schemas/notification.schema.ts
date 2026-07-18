// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";
import { ALERT_EVENT_TYPES } from "../../../domain/value-objects/alert-event-type";
import { renderTemplate, sampleTemplateContext } from "../../notifier/template-renderer";

const templateSchema = z.object({
  subject: z.string().max(255).optional(),
  body: z.string().min(1).max(10_000),
});

const eventsSchema = z.union([z.literal("all"), z.array(z.enum(ALERT_EVENT_TYPES)).min(1)]);

const templatesSchema = z.record(z.enum(ALERT_EVENT_TYPES), templateSchema);

/**
 * Valida el formato mínimo por canal (JSON válido para webhook, asunto+cuerpo para email)
 * renderizando cada plantilla contra un contexto de ejemplo antes de guardar.
 */
function validateTemplatesForType(
  type: string,
  templates: Record<string, { subject?: string; body: string }> | undefined,
  ctx: z.RefinementCtx,
): void {
  if (!templates) return;
  const sample = sampleTemplateContext();

  for (const [eventType, template] of Object.entries(templates)) {
    const rendered = renderTemplate(template.body, sample);

    if (type === "webhook") {
      try {
        JSON.parse(rendered);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La plantilla de webhook para el evento ${eventType} no produce un JSON válido`,
          path: ["templates", eventType, "body"],
        });
      }
    }

    if (type === "email") {
      if (!template.subject || template.subject.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La plantilla de email para el evento ${eventType} requiere un asunto`,
          path: ["templates", eventType, "subject"],
        });
      }
      if (!template.body || template.body.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La plantilla de email para el evento ${eventType} requiere un cuerpo`,
          path: ["templates", eventType, "body"],
        });
      }
    }
  }
}

export const createNotificationSchema = z
  .object({
    name: z.string().min(1).max(255),
    type: z.enum(["email", "slack", "telegram", "discord", "webhook"]),
    config: z.record(z.any()),
    isActive: z.boolean().optional(),
    events: eventsSchema.optional(),
    templates: templatesSchema.optional(),
  })
  .superRefine((data, ctx) => validateTemplatesForType(data.type, data.templates, ctx));

export const updateNotificationSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    config: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
    events: eventsSchema.optional(),
    templates: templatesSchema.optional(),
    // El tipo de canal es inmutable tras la creación; se requiere para validar plantillas al editar.
    type: z.enum(["email", "slack", "telegram", "discord", "webhook"]).optional(),
  })
  .superRefine((data, ctx) => validateTemplatesForType(data.type ?? "", data.templates, ctx));
