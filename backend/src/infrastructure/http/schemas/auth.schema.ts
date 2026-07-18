// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase()),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const loginSchema = z.object({
  identifier: z.string().trim().optional(),
  email: z.string().trim().optional(),
  password: z.string().min(1),
})
  .refine((v) => !!(v.identifier || v.email), {
    message: "identifier is required",
    path: ["identifier"],
  })
  .transform((v) => ({
    identifier: (v.identifier ?? v.email ?? "").toLowerCase(),
    password: v.password,
  }));
