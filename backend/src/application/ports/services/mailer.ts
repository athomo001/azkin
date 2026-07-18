// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

/**
 * Puerto (interfaz) para el envío de correos transaccionales de aplicación
 * (ej. recuperación de contraseña), independiente de los canales de alerta de monitores.
 */
export interface IMailer {
  send(input: SendMailInput): Promise<void>;
}
