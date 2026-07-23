// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstance } from "../../../domain/entities/federated-instance";

export interface CreateFederatedInstanceData {
  label: string;
  remoteUrl: string;
  remoteFederationPort: number;
  peerCertFingerprint: string;
  createdById: string;
}

/**
 * Puerto (interfaz) para la persistencia de instancias Azkin federadas.
 */
export interface IFederatedInstanceRepository {
  create(data: CreateFederatedInstanceData): Promise<IFederatedInstance>;
  findAll(): Promise<IFederatedInstance[]>;
  findById(id: string): Promise<IFederatedInstance | null>;
  /** Cuenta instancias con status "enrolled" (excluye revocadas) para aplicar la cuota máxima. */
  countActive(): Promise<number>;
  revoke(id: string): Promise<IFederatedInstance | null>;
  /** Busca una instancia enrolada (no revocada) por la huella de certificado presentada en un
   * request entrante al listener mTLS — null si no hay match o está revocada. */
  findEnrolledByFingerprint(fingerprint: string): Promise<IFederatedInstance | null>;
  /** Todas las instancias "enrolled" (para el tick de sondeo periódico). */
  findAllActive(): Promise<IFederatedInstance[]>;
  markSyncSuccess(id: string, at: Date): Promise<void>;
  setNotifiedDown(id: string, notifiedDown: boolean): Promise<void>;
}
