// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import nodemailer from "nodemailer";
import { IMailer, SendMailInput, SendMailOptions } from "../../application/ports/services/mailer";
import { logger } from "../logger";
import { getErrorMessage } from "../../application/services/get-error-message";

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

  async send(input: SendMailInput, options?: SendMailOptions): Promise<void> {
    const { host, port, secure, user, password, from } = this.config;
    if (!host || !user || !password) {
      if (options?.throwOnFailure) {
        throw new Error("SMTP no configurado (falta host, usuario o contraseña)");
      }
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
    } catch (err) {
      if (options?.throwOnFailure) throw err;
      logger.error(`[SMTP] Error al enviar correo transaccional: ${getErrorMessage(err)}. Fallback a mock.`);
      this.logMock(input);
    }
  }

  private logMock(input: SendMailInput): void {
    logger.warn(`[SMTP MOCK] Para: ${input.to}`);
    logger.warn(`[SMTP MOCK] Asunto: ${input.subject}`);
    logger.warn(`[SMTP MOCK] Mensaje:\n${input.text}`);
  }
}
