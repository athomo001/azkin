// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeInstanceUrl } from "./normalize-instance-url";

test("normalizeInstanceUrl antepone https:// a una IP o dominio simple sin esquema", () => {
  assert.equal(normalizeInstanceUrl("203.0.113.5"), "https://203.0.113.5");
  assert.equal(normalizeInstanceUrl("mi-azkin.miempresa.cl"), "https://mi-azkin.miempresa.cl");
});

test("normalizeInstanceUrl antepone http:// si se especifica un puerto de desarrollo/HTTP o localhost sin esquema", () => {
  assert.equal(normalizeInstanceUrl("192.168.1.50:3000"), "http://192.168.1.50:3000");
  assert.equal(normalizeInstanceUrl("localhost:3000"), "http://localhost:3000");
  assert.equal(normalizeInstanceUrl("localhost"), "http://localhost");
});

test("normalizeInstanceUrl deja igual una URL que ya trae esquema", () => {
  assert.equal(normalizeInstanceUrl("https://mi-azkin.miempresa.cl"), "https://mi-azkin.miempresa.cl");
  assert.equal(normalizeInstanceUrl("http://203.0.113.5:8080"), "http://203.0.113.5:8080");
});

test("normalizeInstanceUrl recorta espacios en blanco", () => {
  assert.equal(normalizeInstanceUrl("  203.0.113.5  "), "https://203.0.113.5");
});
