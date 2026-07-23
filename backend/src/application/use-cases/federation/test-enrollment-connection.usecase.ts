// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { checkTcpReachability } from "../../services/check-tcp-reachability";
import { getErrorMessage } from "../../services/get-error-message";
import { ValidationError } from "../../../domain/errors/domain-error";

export interface TestEnrollmentConnectionInput {
  code: string;
}

export interface TestConnectionResult {
  url: string;
  urlReachable: boolean;
  urlError?: string;
  urlLatencyMs?: number;
  federationPort: number;
  portReachable: boolean;
  portError?: string;
  portLatencyMs?: number;
}

/**
 * Prueba si esta instancia puede alcanzar por red a la instancia remota codificada en un código
 * de enrollment (AZ-049) — **antes** de consumir el token de un solo uso. No autentica nada: es
 * un chequeo TCP puro (ver `checkTcpReachability`) contra la URL pública y el puerto de
 * federación, para responder "¿llegamos o no?" sin arriesgar el token ni depender de que ya
 * exista un certificado del par.
 */
export class TestEnrollmentConnectionUseCase {
  async execute(input: TestEnrollmentConnectionInput): Promise<TestConnectionResult> {
    const { url, port } = this.decodeCode(input.code);

    let host: string;
    let urlPort: number;
    try {
      const parsed = new URL(url);
      host = parsed.hostname;
      urlPort = parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80;
    } catch (err) {
      throw new ValidationError(`La URL del código de enrollment no es válida: ${getErrorMessage(err)}`);
    }

    const [urlResult, portResult] = await Promise.all([
      checkTcpReachability(host, urlPort),
      checkTcpReachability(host, port),
    ]);

    return {
      url,
      urlReachable: urlResult.reachable,
      urlError: urlResult.error,
      urlLatencyMs: urlResult.latencyMs,
      federationPort: port,
      portReachable: portResult.reachable,
      portError: portResult.error,
      portLatencyMs: portResult.latencyMs,
    };
  }

  private decodeCode(code: string): { url: string; port: number } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(code, "base64url").toString("utf8"));
    } catch (err) {
      throw new ValidationError(`El código de enrollment no tiene un formato válido: ${getErrorMessage(err)}`);
    }

    const { url, port } = (parsed ?? {}) as { url?: unknown; port?: unknown };
    if (typeof url !== "string" || !url || typeof port !== "number") {
      throw new ValidationError(
        "El código de enrollment no tiene un formato válido, o es de una versión anterior sin puerto de federación",
      );
    }

    return { url, port };
  }
}
