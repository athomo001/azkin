// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  IFederationClient,
  RemoteMonitorSummary,
  RemotePeerAddress,
  RequestEnrollmentInput,
  SyncedHeartbeat,
} from "../../application/ports/services/federation-client";
import { ValidationError } from "../../domain/errors/domain-error";
import { getErrorMessage } from "../../application/services/get-error-message";

/**
 * Implementa los llamados salientes de federación. Todos corren sobre el mismo puerto que la API
 * principal del par (con o sin HTTPS nativo, según cómo tenga configurado el destino) — no hay
 * agente mTLS ni certificado de cliente: la autenticación es el secreto compartido en el header
 * `X-Federation-Secret` (ver verify-peer-secret.ts), un `fetch()` liso en todos los casos.
 */
export class FederationFetchClient implements IFederationClient {
  async requestEnrollment(input: RequestEnrollmentInput): Promise<void> {
    const url = `${input.remoteUrl.replace(/\/$/, "")}/api/v1/federation/enrollments`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: input.token,
          callerLabel: input.callerLabel,
          callerUrl: input.callerUrl,
          callerSecret: input.callerSecret,
        }),
      });
    } catch (err) {
      throw new ValidationError(`No se pudo contactar la instancia remota: ${getErrorMessage(err)}`);
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new ValidationError(body.message ?? `La instancia remota rechazó el enrollment (HTTP ${res.status})`);
    }
  }

  async listRemoteMonitors(peer: RemotePeerAddress): Promise<RemoteMonitorSummary[]> {
    return this.peerGet(peer, "/monitors");
  }

  async syncHeartbeats(peer: RemotePeerAddress, remoteMonitorId: string, since: Date | null): Promise<SyncedHeartbeat[]> {
    const qs = new URLSearchParams({ monitorId: remoteMonitorId });
    if (since) qs.set("since", since.toISOString());
    return this.peerGet(peer, `/sync?${qs.toString()}`);
  }

  private async peerGet<T>(peer: RemotePeerAddress, path: string): Promise<T> {
    const url = `${peer.remoteUrl.replace(/\/$/, "")}/api/v1/federation/peer${path}`;

    let res: Response;
    try {
      res = await fetch(url, { headers: { "X-Federation-Secret": peer.secret } });
    } catch (err) {
      throw new ValidationError(`No se pudo contactar al par federado: ${getErrorMessage(err)}`);
    }
    if (!res.ok) {
      throw new ValidationError(`El par respondió con error (HTTP ${res.status}) en ${path}`);
    }
    return (await res.json()) as T;
  }
}
