// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Configuración de red persistida de esta instancia para federación: el override de puerto que
 * sustituye a `AZKIN_FEDERATION_PORT` cuando existe (mismo patrón que `ITlsConfig` para el puerto
 * HTTPS, AZ-006, pero sin datos de certificado — la identidad de federación vive en
 * `FederationIdentity`), y la URL/IP pública por la que esta instancia es alcanzable, para no
 * tener que pedirla a mano en cada invitación/enrollment. Ambos campos son independientes entre
 * sí (se puede guardar uno sin el otro), por eso los dos son opcionales acá.
 */
export interface IFederationPortSettings {
  id: string;
  port?: number;
  ownUrl?: string;
  updatedAt: Date;
  updatedById: string;
}
