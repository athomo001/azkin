// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveReportScopeMonitors } from "./report-scope-resolver";

interface FakeMonitor {
  id: string;
  group: string | null;
}

const monitors: FakeMonitor[] = [
  { id: "m1", group: "Comercial" },
  { id: "m2", group: "Comercial" },
  { id: "m3", group: "Infra" },
  { id: "m4", group: null },
];

test("resolveReportScopeMonitors con scope 'all' devuelve todos los monitores", () => {
  const result = resolveReportScopeMonitors(monitors, [{ type: "all" }]);
  assert.deepEqual(result.map((m) => m.id), ["m1", "m2", "m3", "m4"]);
});

test("resolveReportScopeMonitors con scope de grupo devuelve solo ese grupo", () => {
  const result = resolveReportScopeMonitors(monitors, [{ type: "group", value: "Comercial" }]);
  assert.deepEqual(result.map((m) => m.id), ["m1", "m2"]);
});

test("resolveReportScopeMonitors con scope de monitor puntual devuelve solo ese monitor", () => {
  const result = resolveReportScopeMonitors(monitors, [{ type: "monitor", value: "m3" }]);
  assert.deepEqual(result.map((m) => m.id), ["m3"]);
});

test("resolveReportScopeMonitors une multiples entradas de scope sin duplicados", () => {
  const result = resolveReportScopeMonitors(monitors, [
    { type: "group", value: "Comercial" },
    { type: "monitor", value: "m1" },
    { type: "monitor", value: "m3" },
  ]);
  assert.deepEqual(result.map((m) => m.id), ["m1", "m2", "m3"]);
});

test("resolveReportScopeMonitors sin coincidencias devuelve lista vacia", () => {
  const result = resolveReportScopeMonitors(monitors, [{ type: "group", value: "Inexistente" }]);
  assert.deepEqual(result, []);
});
