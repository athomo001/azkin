// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { IAppSmtpSettings } from "../../../domain/entities/app-smtp-settings";

export interface UpsertAppSmtpSettingsData {
  notificationChannelId: string | null;
  updatedById: string;
}

/**
 * Puerto (interfaz) para la persistencia de la configuración de SMTP de aplicación (documento único).
 */
export interface IAppSmtpSettingsRepository {
  getActive(): Promise<IAppSmtpSettings | null>;
  upsert(data: UpsertAppSmtpSettingsData): Promise<IAppSmtpSettings>;
}
