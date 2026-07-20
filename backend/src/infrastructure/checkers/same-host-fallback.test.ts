// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrivateIpv4, isConnectionLevelError, shouldAttemptHostGatewayFallback } from "./same-host-fallback";

test("isPrivateIpv4 reconoce los rangos RFC 1918 y loopback", () => {
  assert.equal(isPrivateIpv4("10.0.100.13"), true);
  assert.equal(isPrivateIpv4("172.16.0.1"), true);
  assert.equal(isPrivateIpv4("172.31.255.255"), true);
  assert.equal(isPrivateIpv4("192.168.1.50"), true);
  assert.equal(isPrivateIpv4("127.0.0.1"), true);
});

test("isPrivateIpv4 rechaza IPs públicas y hostnames", () => {
  assert.equal(isPrivateIpv4("8.8.8.8"), false);
  assert.equal(isPrivateIpv4("172.32.0.1"), false); // fuera del rango 172.16-31
  assert.equal(isPrivateIpv4("172.15.0.1"), false);
  assert.equal(isPrivateIpv4("ejemplo.com"), false);
  assert.equal(isPrivateIpv4("host.docker.internal"), false);
});

test("isPrivateIpv4 rechaza octetos fuera de rango (no es una IP válida)", () => {
  assert.equal(isPrivateIpv4("10.999.0.1"), false);
});

test("isConnectionLevelError distingue errores de red de otros errores", () => {
  assert.equal(isConnectionLevelError("ECONNREFUSED"), true);
  assert.equal(isConnectionLevelError("ETIMEDOUT"), true);
  assert.equal(isConnectionLevelError("ENETUNREACH"), true);
  assert.equal(isConnectionLevelError("EHOSTUNREACH"), true);
  assert.equal(isConnectionLevelError("ENOTFOUND"), false);
  assert.equal(isConnectionLevelError(undefined), false);
});

test("shouldAttemptHostGatewayFallback aplica por IP privada aunque sameHostAsAzkin no esté marcado", () => {
  assert.equal(shouldAttemptHostGatewayFallback("10.0.100.13", undefined, "ECONNREFUSED"), true);
  assert.equal(shouldAttemptHostGatewayFallback("10.0.100.13", false, "ECONNREFUSED"), true);
});

test("shouldAttemptHostGatewayFallback aplica por sameHostAsAzkin aunque el target no sea una IP privada (dominio propio)", () => {
  assert.equal(shouldAttemptHostGatewayFallback("mi-servicio-interno.miempresa.com", true, "ECONNREFUSED"), true);
});

test("shouldAttemptHostGatewayFallback nunca aplica ante un error que no es de conexión, ni con sameHostAsAzkin marcado", () => {
  assert.equal(shouldAttemptHostGatewayFallback("10.0.100.13", true, "ENOTFOUND"), false);
  assert.equal(shouldAttemptHostGatewayFallback("10.0.100.13", true, undefined), false);
});

test("shouldAttemptHostGatewayFallback no aplica para IP pública sin sameHostAsAzkin marcado", () => {
  assert.equal(shouldAttemptHostGatewayFallback("8.8.8.8", undefined, "ECONNREFUSED"), false);
  assert.equal(shouldAttemptHostGatewayFallback("8.8.8.8", false, "ECONNREFUSED"), false);
});
