// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import nodemailer from "nodemailer";
import { IMailer, SendMailInput, SendMailOptions } from "../../application/ports/services/mailer";
import { ISmtpConfigResolver } from "../../application/ports/services/smtp-config-resolver";
import { logger } from "../logger";
import { getErrorMessage } from "../../application/services/get-error-message";

/**
 * Adaptador de correo transaccional a nivel de aplicación (ej. recuperación de contraseña).
 * La configuración se resuelve en cada envío vía `ISmtpConfigResolver` (env vars por defecto, o
 * el SMTP de un canal de notificación reutilizado — ver `ResolveAppSmtpConfig`), no una única vez
 * al construirse, para que un cambio de canal se refleje sin reiniciar el backend.
 * Si no hay SMTP configurado, registra el correo en el log (modo mock) en vez de fallar,
 * útil para desarrollo/pruebas.
 */
export class SmtpMailer implements IMailer {
  constructor(private readonly configResolver: ISmtpConfigResolver) {}

  async send(input: SendMailInput, options?: SendMailOptions): Promise<void> {
    const { host, port, secure, user, password, from } = await this.configResolver.resolve();
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
        html: input.html,
        attachments: input.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
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
