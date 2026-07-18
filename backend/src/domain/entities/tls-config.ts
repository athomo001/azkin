// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Configuración TLS activa del listener HTTPS nativo del backend.
 * La clave privada nunca se expone en texto plano fuera de esta entidad (se persiste cifrada).
 */
export interface ITlsConfig {
  id: string;
  certPem: string;
  keyPemEncrypted: string; // AES-256-GCM, base64 (iv + authTag + ciphertext)
  chainPem?: string;
  port: number;
  httpRedirect: boolean;
  updatedAt: Date;
  updatedById: string;
}
