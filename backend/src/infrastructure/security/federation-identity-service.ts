// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  FederationIdentityData,
  IFederationIdentityRepository,
} from "../../application/ports/repositories/federation-identity-repository";
import {
  FederationIdentity,
  FederationServerCredentials,
  IFederationIdentityService,
} from "../../application/ports/services/federation-identity";
import { getCertificateFingerprint } from "../../application/services/get-certificate-fingerprint";
import { ValidationError } from "../../domain/errors/domain-error";
import { decryptPrivateKey, encryptPrivateKey } from "./tls-key-cipher";
import { generateSelfSignedCertificate } from "./federation-certificate-generator";

/**
 * Genera (una sola vez, de forma perezosa) y persiste el certificado de identidad de federación
 * de esta instancia. Reutiliza el mismo cifrado AES-256-GCM en reposo que ya usa la clave
 * privada TLS (`AZKIN_TLS_ENCRYPTION_KEY`), en vez de introducir una clave/env var nueva.
 */
export class FederationIdentityService implements IFederationIdentityService {
  constructor(
    private readonly identity: IFederationIdentityRepository,
    private readonly encryptionKey: string,
  ) {}

  async getOrCreateOwnCertificate(): Promise<FederationIdentity> {
    const data = await this.ensureIdentity();
    return { certPem: data.certPem, fingerprint: data.fingerprint };
  }

  async getOwnServerCredentials(): Promise<FederationServerCredentials> {
    const data = await this.ensureIdentity();
    const keyPem = decryptPrivateKey(data.keyPemEncrypted, this.encryptionKey);
    return { certPem: data.certPem, keyPem, fingerprint: data.fingerprint };
  }

  private async ensureIdentity(): Promise<FederationIdentityData> {
    const existing = await this.identity.get();
    if (existing) {
      return existing;
    }

    // En la práctica esto solo se alcanza si AZKIN_TLS_ENCRYPTION_KEY fue fijada a mano con un
    // valor mal formado (por defecto se deriva sola de AZKIN_JWT_SECRET, ver
    // resolve-tls-encryption-key.ts) — falla solo al usarse, no al arrancar el backend, mismo
    // criterio que AZ-041: no tumbar todo el proceso por una función opcional.
    if (!this.encryptionKey) {
      throw new ValidationError(
        "AZKIN_TLS_ENCRYPTION_KEY tiene un valor inválido (64 caracteres hexadecimales) — corrígelo o quítalo del .env para volver a la clave derivada automáticamente",
      );
    }

    const { certPem, keyPem } = generateSelfSignedCertificate("azkin-federation");
    const fingerprint = getCertificateFingerprint(certPem);
    const keyPemEncrypted = encryptPrivateKey(keyPem, this.encryptionKey);
    return this.identity.create({ certPem, keyPemEncrypted, fingerprint });
  }
}
