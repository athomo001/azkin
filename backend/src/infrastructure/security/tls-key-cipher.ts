// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Cifra/descifra la clave privada TLS en reposo con AES-256-GCM.
 * encryptionKeyHex debe ser una clave de 32 bytes codificada en hexadecimal (64 caracteres).
 */
export function encryptPrivateKey(pem: string, encryptionKeyHex: string): string {
  const key = Buffer.from(encryptionKeyHex, "hex");
  if (key.length !== 32) {
    throw new Error("AZKIN_TLS_ENCRYPTION_KEY debe ser una clave hexadecimal de 32 bytes (64 caracteres)");
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(pem, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptPrivateKey(payload: string, encryptionKeyHex: string): string {
  const key = Buffer.from(encryptionKeyHex, "hex");
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
