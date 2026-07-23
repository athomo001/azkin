// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Agent, fetch as undiciFetch } from "undici";
import {
  IFederationClient,
  RemoteMonitorSummary,
  RemotePeerAddress,
  RequestEnrollmentInput,
  RequestEnrollmentResult,
  SyncedHeartbeat,
} from "../../application/ports/services/federation-client";
import { IFederationIdentityService } from "../../application/ports/services/federation-identity";
import { ValidationError } from "../../domain/errors/domain-error";
import { getErrorMessage } from "../../application/services/get-error-message";

/**
 * Implementa los llamados salientes de federación. `requestEnrollment` usa `fetch()` nativo sin
 * certificado de cliente (bootstrap, protegido solo por el token — mismo mecanismo que ya usa
 * `multichannel-notifier.ts` para webhooks). `listRemoteMonitors`/`syncHeartbeats` presentan el
 * certificado propio como client cert (mTLS) vía `undici.Agent`, contra el listener dedicado del
 * par (AZ-049, slice 2) — `undici` ya es dependencia directa del backend.
 */
export class FederationFetchClient implements IFederationClient {
  constructor(private readonly identity: IFederationIdentityService) {}

  async requestEnrollment(input: RequestEnrollmentInput): Promise<RequestEnrollmentResult> {
    const url = `${input.remoteUrl.replace(/\/$/, "")}/api/v1/federation/enrollments`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: input.token,
          callerCertPem: input.callerCertPem,
          callerLabel: input.callerLabel,
          callerUrl: input.callerUrl,
          callerFederationPort: input.callerFederationPort,
        }),
      });
    } catch (err) {
      throw new ValidationError(`No se pudo contactar la instancia remota: ${getErrorMessage(err)}`);
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new ValidationError(body.message ?? `La instancia remota rechazó el enrollment (HTTP ${res.status})`);
    }

    const data = (await res.json().catch(() => ({}))) as { ownCertPem?: string; ownFederationPort?: number };
    if (!data.ownCertPem || !data.ownFederationPort) {
      throw new ValidationError("Respuesta de enrollment inválida de la instancia remota");
    }

    return { ownCertPem: data.ownCertPem, ownFederationPort: data.ownFederationPort };
  }

  async listRemoteMonitors(peer: RemotePeerAddress): Promise<RemoteMonitorSummary[]> {
    return this.mtlsGet(peer, "/federation/monitors");
  }

  async syncHeartbeats(peer: RemotePeerAddress, remoteMonitorId: string, since: Date | null): Promise<SyncedHeartbeat[]> {
    const qs = new URLSearchParams({ monitorId: remoteMonitorId });
    if (since) qs.set("since", since.toISOString());
    return this.mtlsGet(peer, `/federation/sync?${qs.toString()}`);
  }

  private async mtlsGet<T>(peer: RemotePeerAddress, path: string): Promise<T> {
    const credentials = await this.identity.getOwnServerCredentials();
    const hostname = new URL(peer.remoteUrl).hostname;
    const url = `https://${hostname}:${peer.remoteFederationPort}${path}`;

    // Sin cadena de CA: el par no tiene una autoridad que valide — la confianza es pinning por
    // huella, verificado por el *receptor* en verify-peer-certificate.ts, no por este cliente.
    const agent = new Agent({ connect: { cert: credentials.certPem, key: credentials.keyPem, rejectUnauthorized: false } });
    try {
      let res: Awaited<ReturnType<typeof undiciFetch>>;
      try {
        res = await undiciFetch(url, { dispatcher: agent });
      } catch (err) {
        throw new ValidationError(`No se pudo contactar el listener de federación del par: ${getErrorMessage(err)}`);
      }
      if (!res.ok) {
        throw new ValidationError(`El par respondió con error (HTTP ${res.status}) en ${path}`);
      }
      return (await res.json()) as T;
    } finally {
      await agent.close();
    }
  }
}
