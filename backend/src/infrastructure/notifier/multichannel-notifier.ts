// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotifier, NotificationEvent } from "../../application/ports/services/notifier";
import { INotificationRepository } from "../../application/ports/repositories/notification-repository";
import { IAuditLogRepository, IIncidentAlertLookup } from "../../application/ports/repositories/audit-log-repository";
import { INotification, SlackConfig, DiscordConfig, TelegramConfig, WebhookConfig, EmailConfig } from "../../domain/entities/notification";
import { MonitorStatus } from "../../domain/value-objects/monitor-status";
import { AlertEventType } from "../../domain/value-objects/alert-event-type";
import { renderTemplate, TemplateContext, escapeJsonStringValue, escapeTelegramMarkdown } from "./template-renderer";
import { defaultTemplateFor } from "./default-templates";
import { logger } from "../logger";
import { getErrorMessage } from "../../application/services/get-error-message";
import nodemailer from "nodemailer";

type NotificationAuditAction =
  | "NOTIFICATION_EMAIL_SENT"
  | "NOTIFICATION_EMAIL_FAILED"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_FAILED";

const OUTAGE_EVENTS: ReadonlySet<AlertEventType> = new Set<AlertEventType>(["DOWN", "DEGRADED"]);

/**
 * Notificador multicanal (Strategy Pattern).
 * Procesa las transiciones de estado de forma asíncrona hacia Slack, Discord, Telegram, Webhooks y Email.
 * Captura excepciones a nivel de canal para evitar que el fallo de una integración afecte a los checkers.
 */
export class MultichannelNotifier implements INotifier {
  // Pares `monitorId:notificationId` con un aviso de caída enviado y aún sin RECOVERED.
  private readonly openIncidents = new Set<string>();

  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly auditLog: IAuditLogRepository,
    // Respaldo persistente de `openIncidents`: tras un reinicio el Set arranca vacío, y sin esto
    // el RECOVERED de una caída ya avisada antes del reinicio se descartaría.
    private readonly incidentLookup?: IIncidentAlertLookup,
  ) {}

  async notify(event: NotificationEvent): Promise<void> {
    const config = await this.notificationRepo.findById(event.notificationId);
    if (!config) {
      logger.warn(`Canal de notificación ${event.notificationId} no encontrado para el usuario ${event.monitor.userId}`);
      return;
    }

    if (!config.isActive) {
      return;
    }

    // Enrutamiento centralizado — el canal solo recibe los eventos para los que está suscrito.
    const isSubscribed = config.events === "all" || config.events.includes(event.eventType);
    if (!isSubscribed && !event.isTest) {
      return;
    }

    if (!event.isTest && !(await this.trackIncident(event, config))) {
      return;
    }

    // Campos que identifican el aviso en auditoría (base de `findLastIncidentAlert`). Los envíos de
    // prueba no los llevan: no deben abrir ni cerrar un incidente real.
    const alertAudit: Record<string, unknown> = event.isTest
      ? { isTest: true }
      : { monitorId: event.monitor.id, monitorName: event.monitor.name, alertEvent: event.eventType };

    const context: TemplateContext = {
      monitor: event.monitor.name,
      monitorId: event.monitor.id,
      monitorType: event.monitor.type,
      url: event.monitor.target ?? "",
      status: MonitorStatus[event.to],
      previousStatus: MonitorStatus[event.from],
      datetime: event.beat.timestamp.toISOString(),
      httpCode: String(event.beat.status),
      ping: event.beat.ping !== null ? String(event.beat.ping) : "N/A",
      detail: event.beat.msg ?? "Sin mensaje descriptivo",
    };

    // Plantilla configurada por el admin para este evento, o la plantilla por defecto del canal.
    const template = config.templates[event.eventType] ?? defaultTemplateFor(event.eventType, config.type);
    const title = renderTemplate(template.subject ?? defaultTemplateFor(event.eventType, config.type).subject ?? "", context);
    const message = renderTemplate(template.body, context);

    try {
      switch (config.type) {
        case "slack":
          await this.sendSlack(config, message);
          break;
        case "discord":
          await this.sendDiscord(config, message);
          break;
        case "telegram":
          // AZ-066: escapa caracteres especiales de Markdown en cada valor sustituido — un
          // nombre de monitor con `_`/`*`/`[texto](url)` no debe poder romper el formato ni
          // simular un link falso dentro de la alerta.
          await this.sendTelegram(config, renderTemplate(template.body, context, escapeTelegramMarkdown));
          break;
        case "webhook":
          // AZ-058: el body de un canal webhook es JSON ya serializado con `{{var}}` como
          // placeholders dentro de valores string — sin este escape, un valor con comillas o
          // backslashes (ej. un nombre de monitor) rompe o adultera el JSON efectivamente enviado.
          await this.sendWebhook(config, renderTemplate(template.body, context, escapeJsonStringValue));
          break;
        case "email":
          await this.sendEmail(config, title, message, alertAudit);
          break;
        default:
          logger.warn(`Tipo de notificación no soportado en runtime: ${config.type}`);
          return;
      }
      // El correo registra su propia auditoría (con destinatarios/remitente) dentro de sendEmail.
      if (config.type !== "email") {
        await this.recordAudit("NOTIFICATION_SENT", config, title, [], alertAudit);
      }
    } catch (err) {
      logger.error(`Error al enviar alerta por el canal ${config.type} (${config.id}): ${getErrorMessage(err)}`);
      if (config.type !== "email") {
        await this.recordAudit("NOTIFICATION_FAILED", config, title, [], { ...alertAudit, error: getErrorMessage(err) });
      }
    }
  }

  /**
   * Un RECOVERED solo sale si este canal recibió antes un aviso de caída (DOWN/DEGRADED) de este
   * monitor: sin esto, un canal no suscrito a DEGRADED recibía "ALERTA RESTABLECIDA" tras cada
   * oscilación UP→DEGRADED→UP (basta un beat lento) sin ninguna alerta previa. Se rastrea por canal
   * y no por `event.from`, para que UP→DOWN→DEGRADED→UP sí cierre el DOWN ya avisado. Devuelve
   * false si el aviso debe descartarse.
   */
  private async trackIncident(event: NotificationEvent, config: INotification): Promise<boolean> {
    const incidentKey = `${event.monitor.id}:${config.id}`;
    if (event.eventType === "RECOVERED") {
      return this.openIncidents.delete(incidentKey) || this.hasOpenIncidentInAudit(event, config);
    }
    if (OUTAGE_EVENTS.has(event.eventType)) {
      this.openIncidents.add(incidentKey);
    }
    return true;
  }

  private async hasOpenIncidentInAudit(event: NotificationEvent, config: INotification): Promise<boolean> {
    if (!this.incidentLookup) return false;
    try {
      const last = await this.incidentLookup.findLastIncidentAlert(event.monitor.id, config.id);
      return last !== null && OUTAGE_EVENTS.has(last);
    } catch (err) {
      logger.warn(`[AUDIT] No se pudo consultar el último aviso del monitor ${event.monitor.id}: ${getErrorMessage(err)}`);
      return false;
    }
  }

  private async sendSlack(config: INotification, text: string): Promise<void> {
    const conf = config.config as unknown as SlackConfig;
    const url = conf?.webhookUrl;
    if (!url) throw new Error("Webhook URL de Slack faltante en la configuración");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`Slack API respondió con código ${res.status}: ${res.statusText}`);
    }
  }

  private async sendDiscord(config: INotification, content: string): Promise<void> {
    const conf = config.config as unknown as DiscordConfig;
    const url = conf?.webhookUrl;
    if (!url) throw new Error("Webhook URL de Discord faltante en la configuración");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      throw new Error(`Discord API respondió con código ${res.status}: ${res.statusText}`);
    }
  }

  private async sendTelegram(config: INotification, text: string): Promise<void> {
    const conf = config.config as unknown as TelegramConfig;
    const botToken = conf?.botToken;
    const chatId = conf?.chatId;
    if (!botToken || !chatId) {
      throw new Error("Token de bot o Chat ID de Telegram faltante en la configuración");
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      throw new Error(`Telegram API respondió con código ${res.status}: ${res.statusText}`);
    }
  }

  private async sendWebhook(config: INotification, renderedJsonBody: string): Promise<void> {
    const conf = config.config as unknown as WebhookConfig;
    const url = conf?.webhookUrl;
    if (!url) throw new Error("Endpoint URL de Webhook faltante en la configuración");

    // renderedJsonBody ya fue validado como JSON válido al guardar la plantilla (ver notification.schema.ts).
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: renderedJsonBody,
    });

    if (!res.ok) {
      throw new Error(`Webhook externo respondió con código ${res.status}: ${res.statusText}`);
    }
  }

  private async sendEmail(
    config: INotification,
    subject: string,
    body: string,
    alertAudit: Record<string, unknown>,
  ): Promise<void> {
    const conf = config.config as unknown as EmailConfig;

    // Obtener los destinatarios (soporta campo email, emailRecipient, o array emails)
    let recipientList: string[] = [];
    if (typeof conf?.email === "string" && conf.email.trim().length > 0) {
      recipientList = [conf.email.trim()];
    } else if (conf?.emailRecipient) {
      recipientList = [conf.emailRecipient];
    } else if (Array.isArray(conf?.emails)) {
      recipientList = conf.emails;
    }

    if (recipientList.length === 0) {
      await this.recordAudit("NOTIFICATION_EMAIL_FAILED", config, subject, recipientList, {
        ...alertAudit,
        reason: "Destinatarios de correo faltantes en la configuración",
      });
      throw new Error("Destinatarios de correo faltantes en la configuración");
    }

    const host = conf?.smtpHost;
    const port = conf?.smtpPort ? parseInt(String(conf.smtpPort), 10) : 587;
    const user = conf?.smtpUsername;
    const pass = conf?.smtpPassword;
    const secure = !!conf?.smtpSecure;
    const from = conf?.smtpFrom || user || "alerta@azkin.io";

    if (host && user && pass) {
      try {
        // AZ-052: sin bypass de validación de certificado TLS — usa el default seguro de
        // nodemailer (rejectUnauthorized: true), igual que smtp-mailer.ts. Antes este transporte
        // desactivaba la validación de forma incondicional (ni siquiera atada a un toggle de
        // Admin), permitiendo un MITM contra el relay SMTP configurado para las alertas.
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });

        await transporter.sendMail({
          from,
          to: recipientList.join(", "),
          subject,
          text: body,
        });
        await this.recordAudit("NOTIFICATION_EMAIL_SENT", config, subject, recipientList, {
          ...alertAudit,
          from,
        });
        logger.info(`[SMTP] Alerta de correo enviada exitosamente a ${recipientList.join(", ")}`);
      } catch (err) {
        await this.recordAudit("NOTIFICATION_EMAIL_FAILED", config, subject, recipientList, {
          ...alertAudit,
          from,
          error: getErrorMessage(err),
        });
        logger.error(`[SMTP] Error al enviar correo real con nodemailer: ${getErrorMessage(err)}. Fallback a mock.`);
        // Fallback a mock
        this.logMockEmail(from, recipientList, subject, body);
      }
    } else {
      await this.recordAudit("NOTIFICATION_EMAIL_FAILED", config, subject, recipientList, {
        ...alertAudit,
        from,
        reason: "SMTP no configurado",
      });
      this.logMockEmail(from, recipientList, subject, body);
    }
  }

  private async recordAudit(
    action: NotificationAuditAction,
    notification: INotification,
    subject: string,
    recipients: string[],
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.auditLog.record({
        actorId: null,
        action,
        targetType: "notification",
        targetIds: [notification.id],
        metadata: {
          attemptedIdentifier: "Sistema",
          notificationName: notification.name,
          notificationType: notification.type,
          subject,
          recipients,
          ...metadata,
        },
      });
    } catch (err) {
      logger.warn(`[AUDIT] No se pudo registrar el envío de la alerta: ${getErrorMessage(err)}`);
    }
  }

  private logMockEmail(from: string, recipients: string[], subject: string, body: string): void {
    logger.warn(`[SMTP MOCK] Enviando correo electrónico...`);
    logger.warn(`[SMTP MOCK] De: ${from}`);
    logger.warn(`[SMTP MOCK] Para: ${recipients.join(", ")}`);
    logger.warn(`[SMTP MOCK] Asunto: ${subject}`);
    logger.warn(`[SMTP MOCK] Mensaje:\n${body}`);
  }
}
