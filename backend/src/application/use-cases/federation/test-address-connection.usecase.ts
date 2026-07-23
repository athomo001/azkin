// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { checkTcpReachability, TcpReachabilityResult } from "../../services/check-tcp-reachability";

export interface TestAddressConnectionInput {
  host: string;
  port: number;
}

/**
 * Prueba de conectividad de red pura (TCP, sin autenticar nada) contra una dirección+puerto que
 * el Admin escribe a mano — independiente de cualquier código de enrollment, para poder probar
 * "¿llegamos?" antes de siquiera generar o pedir un código (ver ISSUES.md AZ-049). `host` tolera
 * tanto una IP/dominio simple como una URL completa (se extrae el hostname en ese caso).
 */
export class TestAddressConnectionUseCase {
  async execute(input: TestAddressConnectionInput): Promise<TcpReachabilityResult> {
    const host = this.extractHost(input.host);
    return checkTcpReachability(host, input.port);
  }

  private extractHost(input: string): string {
    const trimmed = input.trim();
    try {
      return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname;
    } catch {
      return trimmed;
    }
  }
}
