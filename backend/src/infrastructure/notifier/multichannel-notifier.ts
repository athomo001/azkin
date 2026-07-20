// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { INotifier, NotificationEvent } from "../../application/ports/services/notifier";
import { INotificationRepository } from "../../application/ports/repositories/notification-repository";
import { INotification, SlackConfig, DiscordConfig, TelegramConfig, WebhookConfig, EmailConfig } from "../../domain/entities/notification";
import { MonitorStatus } from "../../domain/value-objects/monitor-status";
import { renderTemplate, TemplateContext } from "./template-renderer";
import { defaultTemplateFor } from "./default-templates";
import { logger } from "../logger";
import { getErrorMessage } from "../../application/services/get-error-message";

/**
 * Notificador multicanal (Strategy Pattern).
 * Procesa las transiciones de estado de forma asíncrona hacia Slack, Discord, Telegram, Webhooks y Email.
 * Captura excepciones a nivel de canal para evitar que el fallo de una integración afecte a los checkers.
 */
export class MultichannelNotifier implements INotifier {
  constructor(private readonly notificationRepo: INotificationRepository) {}

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
          await this.sendTelegram(config, message);
          break;
        case "webhook":
          await this.sendWebhook(config, message);
          break;
        case "email":
          await this.sendEmail(config, title, message);
          break;
        default:
          logger.warn(`Tipo de notificación no soportado en runtime: ${config.type}`);
      }
    } catch (err) {
      logger.error(`Error al enviar alerta por el canal ${config.type} (${config.id}): ${getErrorMessage(err)}`);
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

  private async sendEmail(config: INotification, subject: string, body: string): Promise<void> {
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
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false // Permite auto-firmados en testing
          }
        });

        await transporter.sendMail({
          from,
          to: recipientList.join(", "),
          subject,
          text: body,
        });
        logger.info(`[SMTP] Alerta de correo enviada exitosamente a ${recipientList.join(", ")}`);
      } catch (err) {
        logger.error(`[SMTP] Error al enviar correo real con nodemailer: ${getErrorMessage(err)}. Fallback a mock.`);
        // Fallback a mock
        this.logMockEmail(from, recipientList, subject, body);
      }
    } else {
      this.logMockEmail(from, recipientList, subject, body);
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
