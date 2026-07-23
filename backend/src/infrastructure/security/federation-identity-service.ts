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
    return this.identity.create({ certPem, keyPemEncrypted, fingerprint });
  }
}
