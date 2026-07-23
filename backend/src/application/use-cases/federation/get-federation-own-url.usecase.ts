// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationSettingsRepository } from "../../ports/repositories/federation-settings-repository";

export interface FederationOwnUrlStatus {
  ownUrl?: string;
}

/**
 * Caso de uso para consultar la dirección pública guardada para esta instancia (ver
 * `SetFederationOwnUrlUseCase`) — usado para mostrarla en el panel y para autocompletar los
 * formularios de invitar/unirse.
 */
export class GetFederationOwnUrlUseCase {
  constructor(private readonly settings: IFederationSettingsRepository) {}

  async execute(): Promise<FederationOwnUrlStatus> {
    const settings = await this.settings.getActive();
    return { ownUrl: settings?.ownUrl };
  }
}
