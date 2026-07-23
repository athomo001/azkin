// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTlsEncryptionKey } from "./resolve-tls-encryption-key";

const VALID_KEY = "a".repeat(64);
const HEX_64_REGEX = /^[0-9a-fA-F]{64}$/;

test("resolveTlsEncryptionKey: sin valor configurado, deriva una clave válida de AZKIN_JWT_SECRET (sin advertencia)", () => {
  const result = resolveTlsEncryptionKey(undefined, "un-jwt-secret-cualquiera");
  assert.match(result.value ?? "", HEX_64_REGEX);
  assert.equal(result.warning, null);
});

test("resolveTlsEncryptionKey: la derivación es determinística para el mismo AZKIN_JWT_SECRET", () => {
  const a = resolveTlsEncryptionKey(undefined, "mismo-secreto");
  const b = resolveTlsEncryptionKey(undefined, "mismo-secreto");
  assert.equal(a.value, b.value);
});

test("resolveTlsEncryptionKey: la derivación difiere para distinto AZKIN_JWT_SECRET (ej. distinto nodo federado)", () => {
  const a = resolveTlsEncryptionKey(undefined, "secreto-nodo-chile");
  const b = resolveTlsEncryptionKey(undefined, "secreto-nodo-china");
  assert.notEqual(a.value, b.value);
});

test("resolveTlsEncryptionKey: un valor explícito válido (64 hex) se acepta sin advertencia, ignorando el jwtSecret", () => {
  const result = resolveTlsEncryptionKey(VALID_KEY, "cualquier-jwt-secret");
  assert.equal(result.value, VALID_KEY);
  assert.equal(result.warning, null);
});

test("resolveTlsEncryptionKey: un valor explícito demasiado corto se ignora con advertencia (no deriva, no lanza ni tumba el proceso)", () => {
  const result = resolveTlsEncryptionKey("abc123", "un-jwt-secret");
  assert.equal(result.value, undefined);
  assert.match(result.warning ?? "", /AZKIN_TLS_ENCRYPTION_KEY/);
});

test("resolveTlsEncryptionKey: caracteres no hexadecimales se ignoran con advertencia", () => {
  const result = resolveTlsEncryptionKey("g".repeat(64), "un-jwt-secret"); // 'g' no es hex válido
  assert.equal(result.value, undefined);
  assert.match(result.warning ?? "", /64 caracteres hexadecimales/);
});

test("resolveTlsEncryptionKey: espacios/saltos de línea accidentales invalidan el valor explícito (caso real reportado)", () => {
  const result = resolveTlsEncryptionKey(VALID_KEY + "\n", "un-jwt-secret");
  assert.equal(result.value, undefined);
  assert.ok(result.warning);
});
