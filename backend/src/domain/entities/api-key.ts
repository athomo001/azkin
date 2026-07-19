// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export type ApiKeyScope = "read" | "write";

/**
 * Credencial de acceso a la API pública (AZ-029). Solo se persiste el hash SHA-256 de la key;
 * el valor en texto plano se muestra al Admin una única vez, en el momento de su creación.
 */
export interface IApiKey {
  id: string;
  adminId: string; // Admin propietario (trazabilidad; el acceso vía key sigue el pool global)
  name: string;
  keyHash: string;
  keyPrefix: string; // Primeros 8 caracteres de la key, para identificarla en la UI sin exponerla
  scopes: ApiKeyScope[];
  lastUsedAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
}
