// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "undici";
import { extractFetchErrorMessage, HttpChecker } from "./http.checker";
import { IMonitor } from "../../domain/entities/monitor";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m1",
    userId: "admin-1",
    name: "Monitor de prueba",
    type: "http",
    // http:// (no https://) a propósito: evita que `HttpChecker.check()` dispare la consulta real
    // de expiración de certificado SSL (`getSslExpiryDays`, vía `tls.connect` directo, fuera del
    // dispatcher mockeado de undici) que requeriría egress de red/DNS real en el entorno de test.
    target: "http://example.test/",
    interval: 60,
    retries: 0,
    retryInterval: 20,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/** Intercepta `undiciFetch` (dispatcher global) devolviendo una respuesta fija con los headers
 * indicados — evita depender de red real para probar la clasificación de códigos de borde de
 * Cloudflare/Vercel en `HttpChecker.check()`. */
async function withMockedResponse<T>(
  status: number,
  headers: Record<string, string>,
  run: () => Promise<T>,
): Promise<T> {
  const originalDispatcher = getGlobalDispatcher();
  const agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
  agent
    .get("http://example.test")
    .intercept({ path: "/", method: "GET" })
    .reply(status, "", { headers });
  try {
    return await run();
  } finally {
    setGlobalDispatcher(originalDispatcher);
    await agent.close();
  }
}

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

test("Cloudflare 429 (rate limit del WAF) se reporta como UP, no como caída", async () => {
  const checker = new HttpChecker();
  const result = await withMockedResponse(429, { "cf-ray": "abc123" }, () =>
    checker.check(makeMonitor()),
  );
  assert.equal(result.ok, true);
  assert.match(result.msg ?? "", /CF WAF - 429/);
});

test("Cloudflare 403 (bloqueo del WAF) sigue reportándose como UP", async () => {
  const checker = new HttpChecker();
  const result = await withMockedResponse(403, { server: "cloudflare" }, () =>
    checker.check(makeMonitor()),
  );
  assert.equal(result.ok, true);
  assert.match(result.msg ?? "", /CF WAF - 403/);
});

test("Cloudflare 522 (origen inalcanzable) se reporta como caída real, no se fuerza a UP", async () => {
  const checker = new HttpChecker();
  const result = await withMockedResponse(522, { "cf-ray": "abc123" }, () =>
    checker.check(makeMonitor()),
  );
  assert.equal(result.ok, false, "522 indica un problema real entre Cloudflare y el origen");
  assert.match(result.msg ?? "", /error de origen/);
});

test("Vercel 429 (rate limit del edge) se reporta como UP, no como caída", async () => {
  const checker = new HttpChecker();
  const result = await withMockedResponse(429, { "x-vercel-id": "cdg1::abcde-123" }, () =>
    checker.check(makeMonitor()),
  );
  assert.equal(result.ok, true);
  assert.match(result.msg ?? "", /Vercel Edge - 429/);
});

test("un 500 sin headers de Cloudflare/Vercel se reporta como caída normal", async () => {
  const checker = new HttpChecker();
  const result = await withMockedResponse(500, {}, () => checker.check(makeMonitor()));
  assert.equal(result.ok, false);
});
