// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { encryptPrivateKey, decryptPrivateKey } from "./tls-key-cipher";

test("encryptPrivateKey/decryptPrivateKey hacen un round-trip exacto", () => {
  const key = crypto.randomBytes(32).toString("hex");
  const pem = "-----BEGIN PRIVATE KEY-----\nfake-key-content\n-----END PRIVATE KEY-----";

  const encrypted = encryptPrivateKey(pem, key);
  assert.notEqual(encrypted, pem);

  const decrypted = decryptPrivateKey(encrypted, key);
  assert.equal(decrypted, pem);
});

test("decryptPrivateKey falla si la clave de cifrado no coincide", () => {
  const key = crypto.randomBytes(32).toString("hex");
  const otherKey = crypto.randomBytes(32).toString("hex");
  const encrypted = encryptPrivateKey("clave-privada-secreta", key);

  assert.throws(() => decryptPrivateKey(encrypted, otherKey));
});

test("encryptPrivateKey rechaza una clave de cifrado con longitud inválida", () => {
  assert.throws(() => encryptPrivateKey("pem", "muy-corta"));
});
