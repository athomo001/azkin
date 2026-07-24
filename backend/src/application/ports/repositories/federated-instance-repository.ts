// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstance } from "../../../domain/entities/federated-instance";

export interface CreateFederatedInstanceData {
  label: string;
  remoteUrl: string;
  remoteSecretEncrypted: string;
  createdById: string;
  status?: import("../../../domain/entities/federated-instance").FederatedInstanceStatus;
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
  approve(id: string): Promise<IFederatedInstance | null>;
  revoke(id: string): Promise<IFederatedInstance | null>;
  reactivate(id: string): Promise<IFederatedInstance | null>;
  delete(id: string): Promise<boolean>;
  /** Todas las instancias "enrolled" (para el tick de sondeo periódico, y para verificar el
   * secreto de un pedido entrante — ver `verify-peer-secret.ts`, máximo 5 por decisión de alcance,
   * así que descifrar y comparar cada una en memoria es más simple que mantener un índice). */
  findAllActive(): Promise<IFederatedInstance[]>;
  markSyncSuccess(id: string, at: Date): Promise<void>;
  setNotifiedDown(id: string, notifiedDown: boolean): Promise<void>;
}
