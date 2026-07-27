// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { JwtTokenService } from "./jwt-token-service";
import { UnauthorizedError } from "../../domain/errors/domain-error";

const SECRET = "a".repeat(32);

test("JwtTokenService: firma y verifica un token de acceso correctamente", () => {
  const service = new JwtTokenService(SECRET, 7200);
  const token = service.sign("user-1", "admin", "access", "admin-1", []);
  const decoded = service.verify(token, "access");

  assert.equal(decoded.userId, "user-1");
  assert.equal(decoded.role, "admin");
});

test("JwtTokenService: un refresh token no puede usarse donde se espera un access token (AZ-054)", () => {
  const service = new JwtTokenService(SECRET, 7200);
  const refreshToken = service.sign("user-1", "admin", "refresh", undefined, [], 7 * 24 * 60 * 60);

  assert.throws(() => service.verify(refreshToken, "access"), UnauthorizedError);
});

test("JwtTokenService: un access token no puede usarse como refresh token (AZ-054)", () => {
  const service = new JwtTokenService(SECRET, 7200);
  const accessToken = service.sign("user-1", "admin", "access");

  assert.throws(() => service.verify(accessToken, "refresh"), UnauthorizedError);
});

test("JwtTokenService: verify() sin expectedType acepta cualquier tipo (compatibilidad, ej. sockets)", () => {
  const service = new JwtTokenService(SECRET, 7200);
  const refreshToken = service.sign("user-1", "admin", "refresh");

  const decoded = service.verify(refreshToken);
  assert.equal(decoded.userId, "user-1");
});

test("JwtTokenService: rechaza un token firmado con un algoritmo distinto de HS256 (AZ-066)", () => {
  const service = new JwtTokenService(SECRET, 7200);
  const noneAlgToken = jwt.sign({ sub: "user-1", role: "admin", typ: "access" }, "", { algorithm: "none" });

  assert.throws(() => service.verify(noneAlgToken, "access"), UnauthorizedError);
});

test("JwtTokenService: rechaza un token con firma inválida", () => {
  const service = new JwtTokenService(SECRET, 7200);
  const otherService = new JwtTokenService("b".repeat(32), 7200);
  const token = otherService.sign("user-1", "admin", "access");

  assert.throws(() => service.verify(token, "access"), UnauthorizedError);
});
