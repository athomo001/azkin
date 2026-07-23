// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { checkTcpReachability, TcpReachabilityResult } from "../../services/check-tcp-reachability";
import { getErrorMessage } from "../../services/get-error-message";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Igual que `TestAddressConnectionUseCase`, pero para un par **ya enrolado** — útil para
 * diagnosticar una instancia que aparece "sin reportar" en el sondeo periódico sin tener que
 * revocarla y volver a enrolarla. Solo prueba el puerto de federación (el que realmente importa
 * para el sondeo), no la URL web del par.
 */
export class TestFederatedInstanceConnectionUseCase {
  constructor(private readonly federatedInstances: IFederatedInstanceRepository) {}

  async execute(instanceId: string): Promise<TcpReachabilityResult> {
    const instance = await this.federatedInstances.findById(instanceId);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    let host: string;
    try {
      host = new URL(instance.remoteUrl).hostname;
    } catch (err) {
      throw new ValidationError(`La URL guardada de la instancia no es válida: ${getErrorMessage(err)}`);
    }

    return checkTcpReachability(host, instance.remoteFederationPort);
  }
}
