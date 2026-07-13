import { z } from "zod";

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const createMonitorSchema = z
  .object({
    name: z.string().min(1),
    type: z.enum(["http", "ping", "port"]),
    target: z.string().min(1),
    port: z.number().int().min(1).max(65535).optional(),
    interval: z.number().int().min(20),
    retries: z.number().int().min(0).default(0),
    retryInterval: z.number().int().min(20).default(60),
    tags: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.type === "port" && data.port === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "port is required when type is 'port'",
        path: ["port"],
      });
    }
    if (data.type === "http" && !isHttpUrl(data.target)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "target must be a valid http(s) URL when type is 'http'",
        path: ["target"],
      });
    }
  });

export const updateMonitorSchema = z
  .object({
    name: z.string().min(1).optional(),
    target: z.string().min(1).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    interval: z.number().int().min(20).optional(),
    retries: z.number().int().min(0).optional(),
    retryInterval: z.number().int().min(20).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field is required",
  });
