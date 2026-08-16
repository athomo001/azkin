// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ListThemeModesUseCase } from "./list-theme-modes.usecase";
import { IThemeModesScanner, ThemeModeSummary } from "../../ports/services/theme-modes-scanner";
import { IThemeModeSettingsRepository } from "../../ports/repositories/theme-mode-settings-repository";
import { IThemeModeSettings } from "../../../domain/entities/theme-mode-settings";

function makeScanner(modes: ThemeModeSummary[]): IThemeModesScanner {
  return { listModes: async () => modes };
}

function makeSettingsRepo(active: IThemeModeSettings | null): IThemeModeSettingsRepository {
  return {
    getActive: async () => active,
    upsert: async () => {
      throw new Error("not implemented");
    },
  };
}

const SONIC: ThemeModeSummary = {
  id: "sonic",
  name: "Sonic",
  emoji: "💨",
  accentColor: "#3b82f6",
  files: ["sonic-Run.gif"],
};

const UMA: ThemeModeSummary = {
  id: "uma",
  name: "Uma Musume",
  emoji: "🐴",
  accentColor: "#a78bfa",
  files: ["yudine-1.gif"],
};

test("ListThemeModesUseCase marca todos los modos como enabled si no hay settings guardados", async () => {
  const useCase = new ListThemeModesUseCase(makeScanner([SONIC, UMA]), makeSettingsRepo(null));

  const result = await useCase.execute();

  assert.equal(result.length, 2);
  assert.equal(result.find((m) => m.id === "sonic")?.enabled, true);
  assert.equal(result.find((m) => m.id === "uma")?.enabled, true);
});

test("ListThemeModesUseCase marca enabled=false los modos incluidos en disabledModeIds", async () => {
  const useCase = new ListThemeModesUseCase(
    makeScanner([SONIC, UMA]),
    makeSettingsRepo({
      id: "settings-1",
      disabledModeIds: ["uma"],
      updatedAt: new Date(),
      updatedById: "admin-1",
    }),
  );

  const result = await useCase.execute();

  assert.equal(result.find((m) => m.id === "sonic")?.enabled, true);
  assert.equal(result.find((m) => m.id === "uma")?.enabled, false);
});

test("ListThemeModesUseCase devuelve lista vacía si el scanner no encuentra modos", async () => {
  const useCase = new ListThemeModesUseCase(makeScanner([]), makeSettingsRepo(null));

  const result = await useCase.execute();

  assert.deepEqual(result, []);
});
