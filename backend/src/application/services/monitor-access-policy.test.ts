// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterMonitorsByPermission } from "./monitor-access-policy";

interface FakeMonitor {
  id: string;
  group: string | null;
}

const monitors: FakeMonitor[] = [
  { id: "m1", group: "generales" },
  { id: "m2", group: "generales" },
  { id: "m3", group: "netics" },
  { id: "m4", group: null },
];

test("filterMonitorsByPermission no filtra nada para un admin (acceso global sin aislamiento por tenant)", () => {
  const result = filterMonitorsByPermission(monitors, "admin", []);
  assert.equal(result.length, 4);
});

test("filterMonitorsByPermission deja pasar todo para un viewer con permiso 'all'", () => {
  const result = filterMonitorsByPermission(monitors, "viewer", [{ type: "all" }]);
  assert.equal(result.length, 4);
});

test("filterMonitorsByPermission filtra por grupo para un viewer con permiso 'group'", () => {
  const result = filterMonitorsByPermission(monitors, "viewer", [{ type: "group", value: "generales" }]);
  assert.deepEqual(result.map((m) => m.id).sort(), ["m1", "m2"]);
});

test("filterMonitorsByPermission filtra por monitor individual para un viewer con permiso 'monitor'", () => {
  const result = filterMonitorsByPermission(monitors, "viewer", [{ type: "monitor", value: "m3" }]);
  assert.deepEqual(result.map((m) => m.id), ["m3"]);
});

test("filterMonitorsByPermission devuelve vacío para un viewer sin ningún permiso (regresión AZ-001)", () => {
  const result = filterMonitorsByPermission(monitors, "viewer", []);
  assert.deepEqual(result, []);
});
