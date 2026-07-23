// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import forge from "node-forge";

export interface GeneratedCertificate {
  certPem: string;
  keyPem: string;
}

/**
 * Genera un par de llaves RSA-2048 y un certificado autofirmado de larga duración (10 años) que
 * identifica a esta instancia frente a sus pares federados. No es una CA que firma certificados
 * de terceros (eso sería sobreingeniería para un máximo de 5 pares, ver AZ-049): es un
 * certificado de identidad propio, validado por huella (fingerprint) — pinning, no cadena de
 * confianza. Node no genera/firma certificados en su `crypto` nativo (solo lectura vía
 * `X509Certificate`), de ahí `node-forge`.
 */
export function generateSelfSignedCertificate(commonName: string): GeneratedCertificate {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

  const attrs = [{ name: "commonName", value: commonName }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    certPem: forge.pki.certificateToPem(cert),
    keyPem: forge.pki.privateKeyToPem(keys.privateKey),
  };
}
