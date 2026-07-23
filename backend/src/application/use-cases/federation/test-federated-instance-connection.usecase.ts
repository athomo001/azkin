// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { checkTcpReachability, TcpReachabilityResult } from "../../services/check-tcp-reachability";
import { getErrorMessage } from "../../services/get-error-message";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";

/**
 * Igual que `TestAddressConnectionUseCase`, pero para un par **ya enrolado** — útil para
 * diagnosticar una instancia que aparece "sin reportar" en el sondeo periódico sin tener que
 * revocarla y volver a enrolarla. Prueba el host+puerto de la URL guardada del par (no hay un
 * puerto de federación separado: el sondeo corre sobre el mismo puerto que su API principal).
 */
export class TestFederatedInstanceConnectionUseCase {
  constructor(private readonly federatedInstances: IFederatedInstanceRepository) {}

  async execute(instanceId: string): Promise<TcpReachabilityResult> {
    const instance = await this.federatedInstances.findById(instanceId);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    let host: string;
    let port: number;
    try {
      const parsed = new URL(instance.remoteUrl);
      host = parsed.hostname;
      port = parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80;
    } catch (err) {
      throw new ValidationError(`La URL guardada de la instancia no es válida: ${getErrorMessage(err)}`);
    }

    return checkTcpReachability(host, port);
  }
}
