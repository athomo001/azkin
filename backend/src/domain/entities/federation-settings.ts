// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Configuración de red persistida de esta instancia para federación: la URL/IP pública por la que
 * esta instancia es alcanzable, para no tener que pedirla a mano en cada invitación/enrollment —
 * se configura una vez y se reutiliza siempre (ver `SetFederationOwnUrlUseCase`).
 */
export interface IFederationSettings {
  id: string;
  ownUrl?: string;
  updatedAt: Date;
  updatedById: string;
}
