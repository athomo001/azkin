// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { diffFields } from "./diff-fields";

test("diffFields detecta un cambio simple de valor primitivo", () => {
  const changes = diffFields({ interval: 60, name: "Sitio" }, { interval: 30 });
  assert.deepEqual(changes, { interval: { from: 60, to: 30 } });
});

test("diffFields ignora campos no incluidos en el patch", () => {
  const changes = diffFields({ interval: 60, name: "Sitio" }, { name: "Sitio" });
  assert.deepEqual(changes, {});
});

test("diffFields ignora campos con valor undefined en el patch", () => {
  const changes = diffFields({ interval: 60 }, { interval: undefined });
  assert.deepEqual(changes, {});
});

test("diffFields no marca cambio cuando un arreglo tiene el mismo contenido pero distinta referencia", () => {
  const changes = diffFields({ tags: ["a", "b"] }, { tags: ["a", "b"] });
  assert.deepEqual(changes, {});
});

test("diffFields detecta cambio en un arreglo con contenido distinto", () => {
  const changes = diffFields({ tags: ["a", "b"] }, { tags: ["a", "c"] });
  assert.deepEqual(changes, { tags: { from: ["a", "b"], to: ["a", "c"] } });
});

test("diffFields detecta un campo nuevo que no existía antes (from undefined)", () => {
  const changes = diffFields({}, { group: "General" });
  assert.deepEqual(changes, { group: { from: undefined, to: "General" } });
});

test("diffFields detecta múltiples cambios a la vez", () => {
  const changes = diffFields(
    { interval: 60, target: "https://a.com", name: "Sitio" },
    { interval: 30, target: "https://b.com", name: "Sitio" },
  );
  assert.deepEqual(changes, {
    interval: { from: 60, to: 30 },
    target: { from: "https://a.com", to: "https://b.com" },
  });
});
