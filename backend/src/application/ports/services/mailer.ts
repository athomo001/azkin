// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

export interface SendMailOptions {
  /** Si es true, propaga el error en vez de caer a modo mock (usado por el test de SMTP). */
  throwOnFailure?: boolean;
}

/**
 * Puerto (interfaz) para el envío de correos transaccionales de aplicación
 * (ej. recuperación de contraseña), independiente de los canales de alerta de monitores.
 */
export interface IMailer {
  send(input: SendMailInput, options?: SendMailOptions): Promise<void>;
}
