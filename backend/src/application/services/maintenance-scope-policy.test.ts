// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { findActiveMaintenanceForMonitor } from "./maintenance-scope-policy";
import { IMaintenanceWindow } from "../../domain/entities/maintenance-window";

function makeWindow(overrides: Partial<IMaintenanceWindow> = {}): IMaintenanceWindow {
  return {
    id: "w1",
    createdBy: "admin-1",
    name: "Ventana de prueba",
    scope: [{ type: "all" }],
    mode: "immediate",
    startAt: null,
    endAt: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const monitor = { id: "m1", group: "grupo-a" };

test("findActiveMaintenanceForMonitor matchea por alcance 'all'", () => {
  const windows = [makeWindow({ scope: [{ type: "all" }] })];
  assert.equal(findActiveMaintenanceForMonitor(monitor, windows)?.id, "w1");
});

test("findActiveMaintenanceForMonitor matchea por alcance 'monitor' exacto", () => {
  const windows = [makeWindow({ scope: [{ type: "monitor", value: "m1" }] })];
  assert.equal(findActiveMaintenanceForMonitor(monitor, windows)?.id, "w1");
});

test("findActiveMaintenanceForMonitor no matchea un 'monitor' distinto", () => {
  const windows = [makeWindow({ scope: [{ type: "monitor", value: "otro-id" }] })];
  assert.equal(findActiveMaintenanceForMonitor(monitor, windows), null);
});

test("findActiveMaintenanceForMonitor matchea por alcance 'group'", () => {
  const windows = [makeWindow({ scope: [{ type: "group", value: "grupo-a" }] })];
  assert.equal(findActiveMaintenanceForMonitor(monitor, windows)?.id, "w1");
});

test("findActiveMaintenanceForMonitor no matchea un 'group' distinto ni un monitor sin grupo", () => {
  const windows = [makeWindow({ scope: [{ type: "group", value: "grupo-b" }] })];
  assert.equal(findActiveMaintenanceForMonitor(monitor, windows), null);

  const monitorSinGrupo = { id: "m2", group: null };
  const windowsGrupoA = [makeWindow({ scope: [{ type: "group", value: "grupo-a" }] })];
  assert.equal(findActiveMaintenanceForMonitor(monitorSinGrupo, windowsGrupoA), null);
});

test("findActiveMaintenanceForMonitor devuelve null si no hay ventanas activas", () => {
  assert.equal(findActiveMaintenanceForMonitor(monitor, []), null);
});
