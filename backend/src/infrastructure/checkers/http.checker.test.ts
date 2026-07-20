// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractFetchErrorMessage } from "./http.checker";

test("extractFetchErrorMessage prefiere el mensaje de la causa real (undici envuelve en 'fetch failed')", () => {
  const cause = new Error("self-signed certificate");
  const err = new TypeError("fetch failed", { cause });
  assert.equal(extractFetchErrorMessage(err), "self-signed certificate");
});

test("extractFetchErrorMessage usa el mensaje del error si no hay causa", () => {
  const err = new Error("ENOTFOUND");
  assert.equal(extractFetchErrorMessage(err), "ENOTFOUND");
});

test("extractFetchErrorMessage tiene un fallback para valores que no son Error", () => {
  assert.equal(extractFetchErrorMessage("algo raro"), "request failed");
  assert.equal(extractFetchErrorMessage(undefined), "request failed");
});
