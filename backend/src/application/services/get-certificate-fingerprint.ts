// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { X509Certificate } from "crypto";

/**
 * Huella SHA-256 de un certificado PEM (usa el parser nativo de Node, no requiere node-forge
 * para leer — solo para generar el certificado autofirmado en primer lugar).
 * Lanza si el PEM no tiene formato de certificado válido.
 */
export function getCertificateFingerprint(certPem: string): string {
  return new X509Certificate(certPem).fingerprint256;
}
