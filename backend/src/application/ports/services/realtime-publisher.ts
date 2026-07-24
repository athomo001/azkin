// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IHeartbeat } from "../../../domain/entities/heartbeat";

export interface IRealtimePublisher {
  /** Emite el heartbeat exclusivamente a la room del usuario dueño. */
  publishHeartbeat(userId: string, beat: IHeartbeat): void;
  /** Emite notificación en tiempo real de nueva instancia federada enrolada. */
  publishFederationEnrolled(userId: string, label: string): void;
  /** Avisa que hay monitores/vínculos federados nuevos o actualizados (auto-vinculación terminada,
   * o un par registró un vínculo recíproco) para que el dashboard se refresque solo, sin F5 — ver
   * AZ-050: `federation:enrolled` se dispara demasiado temprano (al enrolar, antes de que la
   * auto-vinculación en segundo plano termine), así que no alcanza para esto. */
  publishFederationLinksUpdated(userId: string): void;
}
