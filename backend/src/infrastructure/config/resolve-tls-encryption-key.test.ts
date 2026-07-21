// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTlsEncryptionKey } from "./resolve-tls-encryption-key";

const VALID_KEY = "a".repeat(64);

test("resolveTlsEncryptionKey: sin valor configurado, no advierte y devuelve undefined", () => {
  const result = resolveTlsEncryptionKey(undefined);
  assert.equal(result.value, undefined);
  assert.equal(result.warning, null);
});

test("resolveTlsEncryptionKey: un valor válido (64 hex) se acepta sin advertencia", () => {
  const result = resolveTlsEncryptionKey(VALID_KEY);
  assert.equal(result.value, VALID_KEY);
  assert.equal(result.warning, null);
});

test("resolveTlsEncryptionKey: un valor demasiado corto se ignora con advertencia (no lanza ni tumba el proceso)", () => {
  const result = resolveTlsEncryptionKey("abc123");
  assert.equal(result.value, undefined);
  assert.match(result.warning ?? "", /AZKIN_TLS_ENCRYPTION_KEY/);
});

test("resolveTlsEncryptionKey: caracteres no hexadecimales se ignoran con advertencia", () => {
  const result = resolveTlsEncryptionKey("g".repeat(64)); // 'g' no es hex válido
  assert.equal(result.value, undefined);
  assert.match(result.warning ?? "", /64 caracteres hexadecimales/);
});

test("resolveTlsEncryptionKey: espacios/saltos de línea accidentales invalidan el valor (caso real reportado)", () => {
  const result = resolveTlsEncryptionKey(VALID_KEY + "\n");
  assert.equal(result.value, undefined);
  assert.ok(result.warning);
});
