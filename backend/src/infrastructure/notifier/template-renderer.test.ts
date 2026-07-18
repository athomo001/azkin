// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderTemplate, sampleTemplateContext } from "./template-renderer";

test("renderTemplate sustituye variables conocidas", () => {
  const rendered = renderTemplate("{{monitor}} está {{status}}", sampleTemplateContext());
  assert.equal(rendered, "Monitor de ejemplo está DOWN");
});

test("renderTemplate deja intacta una variable desconocida sin romper el resto", () => {
  const rendered = renderTemplate("{{monitor}} / {{campoInexistente}}", sampleTemplateContext());
  assert.equal(rendered, "Monitor de ejemplo / {{campoInexistente}}");
});
