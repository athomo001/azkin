// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import nodemailer from "nodemailer";
import { IMailer, SendMailInput } from "../../application/ports/services/mailer";
import { logger } from "../logger";

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
}

/**
 * Adaptador de correo transaccional a nivel de aplicación (ej. recuperación de contraseña).
 * Si no hay SMTP configurado, registra el correo en el log (modo mock) en vez de fallar,
 * útil para desarrollo/pruebas.
 */
export class SmtpMailer implements IMailer {
  constructor(private readonly config: SmtpConfig) {}

  async send(input: SendMailInput): Promise<void> {
    const { host, port, secure, user, password, from } = this.config;
    if (!host || !user || !password) {
      this.logMock(input);
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port: port ?? 587,
        secure: !!secure,
        auth: { user, pass: password },
      });
      await transporter.sendMail({
        from: from || user,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
    } catch (err: any) {
      logger.error(`[SMTP] Error al enviar correo transaccional: ${err.message ?? err}. Fallback a mock.`);
      this.logMock(input);
    }
  }

  private logMock(input: SendMailInput): void {
    logger.warn(`[SMTP MOCK] Para: ${input.to}`);
    logger.warn(`[SMTP MOCK] Asunto: ${input.subject}`);
    logger.warn(`[SMTP MOCK] Mensaje:\n${input.text}`);
  }
}
