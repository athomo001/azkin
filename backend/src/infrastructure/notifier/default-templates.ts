// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { AlertEventType } from "../../domain/value-objects/alert-event-type";
import { INotificationTemplate } from "../../domain/entities/notification";

const TITLES: Record<AlertEventType, string> = {
  DOWN: "ALERTA DE CAÍDA (DOWN)",
  RECOVERED: "ALERTA RESTABLECIDA (UP)",
  DEGRADED: "ALERTA DE DEGRADACIÓN (RESPUESTA LENTA/ANÓMALA)",
  LATENCY_HIGH: "ALERTA DE LATENCIA ALTA",
  DEFACEMENT: "ALERTA DE DEFACEMENT",
};

const DEFAULT_BODY =
  "🚨 *{{status}}* 🚨\n\n*Monitor:* {{monitor}}\n*Objetivo:* {{url}}\n*Estado:* {{previousStatus}} ➡️ {{status}}\n*Detalle:* {{detail}}\n*Ping:* {{ping}} ms\n*Fecha/Hora:* {{datetime}}";

const DEFAULT_WEBHOOK_BODY = JSON.stringify({
  event: "monitor.status_changed",
  monitor: { id: "{{monitorId}}", name: "{{monitor}}", type: "{{monitorType}}", target: "{{url}}" },
  transition: { from: "{{previousStatus}}", to: "{{status}}" },
  heartbeat: { timestamp: "{{datetime}}", ping: "{{ping}}", msg: "{{detail}}" },
});

export function defaultTemplateFor(eventType: AlertEventType, channelType: string): INotificationTemplate {
  if (channelType === "webhook") {
    return { body: DEFAULT_WEBHOOK_BODY };
  }
  return { subject: TITLES[eventType], body: DEFAULT_BODY };
}
