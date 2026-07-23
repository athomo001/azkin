// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { checkTcpReachability } from "../../services/check-tcp-reachability";
import { getErrorMessage } from "../../services/get-error-message";
import { NotFoundError, ValidationError } from "../../../domain/errors/domain-error";
import { TestConnectionResult } from "./test-enrollment-connection.usecase";

/**
 * Igual que `TestEnrollmentConnectionUseCase`, pero para un par **ya enrolado** — útil para
 * diagnosticar una instancia que aparece "sin reportar" en el sondeo periódico sin tener que
 * revocarla y volver a enrolarla.
 */
export class TestFederatedInstanceConnectionUseCase {
  constructor(private readonly federatedInstances: IFederatedInstanceRepository) {}

  async execute(instanceId: string): Promise<TestConnectionResult> {
    const instance = await this.federatedInstances.findById(instanceId);
    if (!instance) {
      throw new NotFoundError("Instancia federada no encontrada");
    }

    let host: string;
    let urlPort: number;
    try {
      const parsed = new URL(instance.remoteUrl);
      host = parsed.hostname;
      urlPort = parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80;
    } catch (err) {
      throw new ValidationError(`La URL guardada de la instancia no es válida: ${getErrorMessage(err)}`);
    }

    const [urlResult, portResult] = await Promise.all([
      checkTcpReachability(host, urlPort),
      checkTcpReachability(host, instance.remoteFederationPort),
    ]);

    return {
      url: instance.remoteUrl,
      urlReachable: urlResult.reachable,
      urlError: urlResult.error,
      urlLatencyMs: urlResult.latencyMs,
      federationPort: instance.remoteFederationPort,
      portReachable: portResult.reachable,
      portError: portResult.error,
      portLatencyMs: portResult.latencyMs,
    };
  }
}
