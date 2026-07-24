// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IHeartbeat } from "../../../domain/entities/heartbeat";

export interface IRealtimePublisher {
  /** Emite el heartbeat exclusivamente a la room del usuario dueño. */
  publishHeartbeat(userId: string, beat: IHeartbeat): void;
  /** Emite notificación en tiempo real de nueva instancia federada enrolada. */
  publishFederationEnrolled(userId: string, label: string): void;
}
