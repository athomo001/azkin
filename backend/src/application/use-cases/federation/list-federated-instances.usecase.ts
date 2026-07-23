// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";

export class ListFederatedInstancesUseCase {
  constructor(private readonly federatedInstances: IFederatedInstanceRepository) {}

  async execute(): Promise<IFederatedInstance[]> {
    return this.federatedInstances.findAll();
  }
}
