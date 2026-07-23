// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Override persistido del puerto del listener mTLS de federación, que sustituye a
 * `AZKIN_FEDERATION_PORT` cuando existe — mismo patrón que `ITlsConfig` para el puerto HTTPS
 * (AZ-006), pero sin datos de certificado (la identidad de federación vive en `FederationIdentity`).
 */
export interface IFederationPortSettings {
  id: string;
  port: number;
  updatedAt: Date;
  updatedById: string;
}
