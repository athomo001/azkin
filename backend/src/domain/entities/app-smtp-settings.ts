// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Configuración de qué SMTP usa la aplicación (correo de recuperación de contraseña).
 * Si `notificationChannelId` es null, se usa el SMTP definido por variables de entorno
 * (`AZKIN_SMTP_*`); si apunta a un canal de notificación de tipo "email", se reutiliza el SMTP
 * de ese canal en su lugar (referencia viva: si el canal cambia su config, el SMTP de aplicación
 * la sigue automáticamente).
 */
export interface IAppSmtpSettings {
  id: string;
  notificationChannelId: string | null;
  updatedAt: Date;
  updatedById: string;
}
