// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  IAppSmtpSettingsRepository,
  UpsertAppSmtpSettingsData,
} from "../../../../application/ports/repositories/app-smtp-settings-repository";
import { IAppSmtpSettings } from "../../../../domain/entities/app-smtp-settings";
import { AppSmtpSettingsDoc, AppSmtpSettingsModel, APP_SMTP_SETTINGS_SINGLETON_ID } from "../schemas/app-smtp-settings.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseAppSmtpSettingsRepository implements IAppSmtpSettingsRepository {
  async getActive(): Promise<IAppSmtpSettings | null> {
    const doc = await AppSmtpSettingsModel.findById(APP_SMTP_SETTINGS_SINGLETON_ID);
    return doc ? this.toDomain(doc) : null;
  }

  async upsert(data: UpsertAppSmtpSettingsData): Promise<IAppSmtpSettings> {
    const doc = await AppSmtpSettingsModel.findByIdAndUpdate(
      APP_SMTP_SETTINGS_SINGLETON_ID,
      {
        notificationChannelId: data.notificationChannelId ? new Types.ObjectId(data.notificationChannelId) : null,
        updatedById: new Types.ObjectId(data.updatedById),
      },
      { new: true, upsert: true },
    );
    return this.toDomain(doc!);
  }

  private toDomain(doc: HydratedDocument<AppSmtpSettingsDoc>): IAppSmtpSettings {
    return {
      id: toDomainId(doc._id),
      notificationChannelId: doc.notificationChannelId ? String(doc.notificationChannelId) : null,
      updatedAt: doc.updatedAt,
      updatedById: String(doc.updatedById),
    };
  }
}
