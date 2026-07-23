// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationIdentityRepository } from "../../application/ports/repositories/federation-identity-repository";
import { FederationIdentity, IFederationIdentityService } from "../../application/ports/services/federation-identity";
import { getCertificateFingerprint } from "../../application/services/get-certificate-fingerprint";
import { ValidationError } from "../../domain/errors/domain-error";
import { encryptPrivateKey } from "./tls-key-cipher";
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
    const existing = await this.identity.get();
    if (existing) {
      return { certPem: existing.certPem, fingerprint: existing.fingerprint };
    }

    // Falla solo al usarse (no al arrancar el backend) si falta la clave de cifrado — mismo
    // criterio que AZ-041 aplicó para AZKIN_TLS_ENCRYPTION_KEY: no tumbar todo el proceso por
    // una variable que solo hace falta para una función opcional.
    if (!this.encryptionKey) {
      throw new ValidationError(
        "Debes configurar AZKIN_TLS_ENCRYPTION_KEY para poder usar la federación de instancias",
      );
    }

    const { certPem, keyPem } = generateSelfSignedCertificate("azkin-federation");
    const fingerprint = getCertificateFingerprint(certPem);
    const keyPemEncrypted = encryptPrivateKey(keyPem, this.encryptionKey);
    await this.identity.create({ certPem, keyPemEncrypted, fingerprint });

    return { certPem, fingerprint };
  }
}
