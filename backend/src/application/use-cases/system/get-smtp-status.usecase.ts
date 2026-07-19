// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface SmtpStatusInput {
  host?: string;
  port: number;
  secure: boolean;
  user?: string;
}

export interface SmtpStatusOutput {
  configured: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
}

/**
 * Caso de uso para exponer el estado de la configuración SMTP de aplicación (AZ-031) —
 * usada para el correo de recuperación de contraseña, distinta del SMTP por canal de
 * notificación. Nunca expone la contraseña; solo si está configurada y con qué host/puerto.
 */
export class GetSmtpStatusUseCase {
  execute(smtp: SmtpStatusInput): SmtpStatusOutput {
    const configured = !!(smtp.host && smtp.user);
    if (!configured) return { configured: false };
    return { configured: true, host: smtp.host, port: smtp.port, secure: smtp.secure };
  }
}
