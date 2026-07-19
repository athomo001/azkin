// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { Request, Response } from "express";
import { makeApiKeyAuth } from "./api-key-auth";
import { IApiKeyRepository } from "../../../application/ports/repositories/api-key-repository";
import { IApiKey } from "../../../domain/entities/api-key";
import { UnauthorizedError, ForbiddenError } from "../../../domain/errors/domain-error";

const PLAIN_KEY = "azk_test-key-value";
const KEY_HASH = crypto.createHash("sha256").update(PLAIN_KEY).digest("hex");

function makeApiKey(overrides: Partial<IApiKey> = {}): IApiKey {
  return {
    id: "key-1",
    adminId: "admin-1",
    name: "Test Key",
    keyHash: KEY_HASH,
    keyPrefix: PLAIN_KEY.slice(0, 12),
    scopes: ["read"],
    lastUsedAt: null,
    createdAt: new Date(),
    revokedAt: null,
    ...overrides,
  };
}

function fakeReq(headers: Record<string, string>, method = "GET"): Request {
  return { headers, method } as unknown as Request;
}

function makeRepo(apiKey: IApiKey | null): IApiKeyRepository & { touched: string[] } {
  const touched: string[] = [];
  return {
    touched,
    create: async () => apiKey!,
    findByHash: async (hash) => (apiKey && hash === apiKey.keyHash ? apiKey : null),
    findAllByAdmin: async () => (apiKey ? [apiKey] : []),
    revoke: async () => true,
    touchLastUsed: async (id) => {
      touched.push(id);
    },
  };
}

test("apiKeyAuth rechaza la petición si falta el header X-API-Key", async () => {
  const middleware = makeApiKeyAuth(makeRepo(null));
  let calledWith: unknown;
  await middleware(fakeReq({}), {} as Response, (err?: unknown) => {
    calledWith = err;
  });
  assert.ok(calledWith instanceof UnauthorizedError);
});

test("apiKeyAuth rechaza una key inexistente o revocada", async () => {
  const middleware = makeApiKeyAuth(makeRepo(null));
  let calledWith: unknown;
  await middleware(fakeReq({ "x-api-key": PLAIN_KEY }), {} as Response, (err?: unknown) => {
    calledWith = err;
  });
  assert.ok(calledWith instanceof UnauthorizedError);
});

test("apiKeyAuth rechaza con ForbiddenError una key de solo lectura usada en un método de escritura", async () => {
  const apiKey = makeApiKey({ scopes: ["read"] });
  const middleware = makeApiKeyAuth(makeRepo(apiKey));
  let calledWith: unknown;
  await middleware(fakeReq({ "x-api-key": PLAIN_KEY }, "POST"), {} as Response, (err?: unknown) => {
    calledWith = err;
  });
  assert.ok(calledWith instanceof ForbiddenError);
});

test("apiKeyAuth puebla el contexto de request y continúa con una key válida de scope suficiente", async () => {
  const apiKey = makeApiKey({ scopes: ["read", "write"] });
  const repo = makeRepo(apiKey);
  const middleware = makeApiKeyAuth(repo);
  const req = fakeReq({ "x-api-key": PLAIN_KEY }, "POST");
  let calledWith: unknown = "not-called";
  await middleware(req, {} as Response, (err?: unknown) => {
    calledWith = err;
  });
  assert.equal(calledWith, undefined);
  assert.equal(req.userId, "admin-1");
  assert.equal(req.userRole, "admin");
  assert.equal(req.adminId, "admin-1");
  assert.deepEqual(req.permissions, []);
});
