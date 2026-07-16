import { z } from "zod";

export const createNotificationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["email", "slack", "telegram", "discord", "webhook"]),
  config: z.record(z.any()),
  isActive: z.boolean().optional(),
});

export const updateNotificationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});
