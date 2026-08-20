// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { z } from "zod";

export const dnsLookupSchema = z.object({
  hostname: z.string().min(1).max(255),
  resolver: z.string().min(1).max(255).optional(),
  recordType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT"]).optional(),
});

export const dnsReverseLookupSchema = z.object({
  ip: z.string().min(1).max(45),
  resolver: z.string().min(1).max(255).optional(),
});
