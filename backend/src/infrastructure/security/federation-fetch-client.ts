// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import {
  IFederationClient,
  RequestEnrollmentInput,
  RequestEnrollmentResult,
} from "../../application/ports/services/federation-client";
import { ValidationError } from "../../domain/errors/domain-error";
import { getErrorMessage } from "../../application/services/get-error-message";

/**
 * Implementa el llamado saliente de enrollment con `fetch()` nativo (Node 24), mismo mecanismo
 * que ya usa `multichannel-notifier.ts` para webhooks — sin agregar una librería HTTP nueva.
 */
export class FederationFetchClient implements IFederationClient {
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
        }),
      });
    } catch (err) {
      throw new ValidationError(`No se pudo contactar la instancia remota: ${getErrorMessage(err)}`);
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new ValidationError(body.message ?? `La instancia remota rechazó el enrollment (HTTP ${res.status})`);
    }

    const data = (await res.json().catch(() => ({}))) as { ownCertPem?: string };
    if (!data.ownCertPem) {
      throw new ValidationError("Respuesta de enrollment inválida de la instancia remota");
    }

    return { ownCertPem: data.ownCertPem };
  }
}
