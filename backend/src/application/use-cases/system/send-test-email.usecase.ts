// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IMailer } from "../../ports/services/mailer";
import { ValidationError } from "../../../domain/errors/domain-error";
import { getErrorMessage } from "../../services/get-error-message";

/**
 * Caso de uso para enviar un correo de prueba usando el SMTP de aplicación,
 * sin esperar a que un usuario real solicite una recuperación de contraseña para
 * descubrir si la configuración funciona.
 */
export class SendTestEmailUseCase {
  constructor(private readonly mailer: IMailer) {}

  async execute(recipient: string): Promise<void> {
    try {
      await this.mailer.send(
        {
          to: recipient,
          subject: "Azkin — Correo de prueba SMTP",
          text: "Si recibiste este correo, la configuración SMTP de aplicación de Azkin funciona correctamente.",
        },
        { throwOnFailure: true },
      );
    } catch (err) {
      throw new ValidationError(`No se pudo enviar el correo de prueba: ${getErrorMessage(err)}`);
    }
  }
}
