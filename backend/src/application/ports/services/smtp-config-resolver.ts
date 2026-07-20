// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
}

/**
 * Puerto para resolver el SMTP efectivo de la aplicación en el momento de enviar un correo
 * (recuperación de contraseña / correo de prueba): por defecto las variables de entorno
 * `AZKIN_SMTP_*`, o el SMTP de un canal de notificación de tipo "email" si el admin eligió
 * reutilizar uno (ver `IAppSmtpSettingsRepository`). Se resuelve en cada envío (no una sola vez
 * al arrancar) para que cambios en el canal reutilizado se reflejen sin reiniciar el backend.
 */
export interface ISmtpConfigResolver {
  resolve(): Promise<SmtpConfig>;
}
