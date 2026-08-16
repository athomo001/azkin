// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { HydratedDocument, Types } from "mongoose";
import {
  IThemeModeSettingsRepository,
  UpsertThemeModeSettingsData,
} from "../../../../application/ports/repositories/theme-mode-settings-repository";
import { IThemeModeSettings } from "../../../../domain/entities/theme-mode-settings";
import {
  THEME_MODE_SETTINGS_SINGLETON_ID,
  ThemeModeSettingsDoc,
  ThemeModeSettingsModel,
} from "../schemas/theme-mode-settings.schema";
import { toDomainId } from "../to-domain-id";

export class MongooseThemeModeSettingsRepository implements IThemeModeSettingsRepository {
  async getActive(): Promise<IThemeModeSettings | null> {
    const doc = await ThemeModeSettingsModel.findById(THEME_MODE_SETTINGS_SINGLETON_ID);
    return doc ? this.toDomain(doc) : null;
  }

  async upsert(data: UpsertThemeModeSettingsData): Promise<IThemeModeSettings> {
    const doc = await ThemeModeSettingsModel.findByIdAndUpdate(
      THEME_MODE_SETTINGS_SINGLETON_ID,
      {
        disabledModeIds: data.disabledModeIds,
        updatedById: new Types.ObjectId(data.updatedById),
      },
      { new: true, upsert: true },
    );
    return this.toDomain(doc!);
  }

  private toDomain(doc: HydratedDocument<ThemeModeSettingsDoc>): IThemeModeSettings {
    return {
      id: toDomainId(doc._id),
      disabledModeIds: doc.disabledModeIds ?? [],
      updatedAt: doc.updatedAt,
      updatedById: String(doc.updatedById),
    };
  }
}
