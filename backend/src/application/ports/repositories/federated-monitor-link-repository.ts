// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedMonitorLink } from "../../../domain/entities/federated-monitor-link";

export interface CreateFederatedMonitorLinkData {
  localMonitorId: string;
  federatedInstanceId: string;
  remoteMonitorId: string;
  remoteMonitorLabel: string;
  createdById: string;
}

/**
 * Puerto (interfaz) para la persistencia de vínculos entre un monitor local y su equivalente en
 * una instancia federada.
 */
export interface IFederatedMonitorLinkRepository {
  create(data: CreateFederatedMonitorLinkData): Promise<IFederatedMonitorLink>;
  findAll(): Promise<IFederatedMonitorLink[]>;
  findByLocalMonitorId(localMonitorId: string): Promise<IFederatedMonitorLink[]>;
  findById(id: string): Promise<IFederatedMonitorLink | null>;
  /** Todos los vínculos que apuntan a una instancia dada (para el tick de sondeo). */
  findByFederatedInstanceId(federatedInstanceId: string): Promise<IFederatedMonitorLink[]>;
  delete(id: string): Promise<boolean>;
  deleteByFederatedInstanceId(federatedInstanceId: string): Promise<number>;
  markSynced(id: string, at: Date): Promise<void>;
}
