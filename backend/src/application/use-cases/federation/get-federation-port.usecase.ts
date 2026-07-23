// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IFederationPortSettingsRepository } from "../../ports/repositories/federation-port-settings-repository";
import { IFederationServerManager } from "../../ports/services/federation-server-manager";

export interface FederationPortStatus {
  port: number; // override vigente, o el default de .env si no hay ninguno guardado
  isOverridden: boolean;
  listenerActive: boolean;
  listenerPort?: number; // puerto realmente escuchado ahora mismo (puede diferir si aún no se aplicó)
}

/**
 * Caso de uso para consultar el puerto vigente del listener mTLS de federación, junto con el
 * estado real del listener — mismo patrón que `GetTlsConfigUseCase` para el puerto HTTPS (AZ-006).
 */
export class GetFederationPortUseCase {
  constructor(
    private readonly portSettings: IFederationPortSettingsRepository,
    private readonly federationServerManager: IFederationServerManager,
    private readonly envDefaultPort: number,
  ) {}

  async execute(): Promise<FederationPortStatus> {
    const override = await this.portSettings.getActive();
    const listenerStatus = this.federationServerManager.getStatus();

    return {
      port: override?.port ?? this.envDefaultPort,
      isOverridden: !!override,
      listenerActive: listenerStatus.active,
      listenerPort: listenerStatus.port,
    };
  }
}
