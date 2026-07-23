// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstance } from "../../../domain/entities/federated-instance";

export interface CreateFederatedInstanceData {
  label: string;
  remoteUrl: string;
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
}
