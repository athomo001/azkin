// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { Request, Response } from "express";
import { makeAuthGuard } from "./auth-guard";
import { ITokenService } from "../../../application/ports/services/security";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";
import { IUser } from "../../../domain/entities/user";
import { UnauthorizedError } from "../../../domain/errors/domain-error";

function makeTokens(payload: { userId: string; role: string; adminId?: string } | null): ITokenService {
  return {
    sign: () => "fake-jwt",
    verify: () => {
      if (!payload) throw new UnauthorizedError("Token inválido o expirado");
      return payload;
    },
  };
}

function makeUsers(user: IUser | null): IUserRepository {
  return { findById: async () => user } as unknown as IUserRepository;
}

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    id: "user-1",
    email: "admin@azkin.test",
    passwordHash: "hashed",
    role: "admin",
    permissions: [],
    preferences: { themeMode: null },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeReq(authorization?: string): Request {
  return { headers: { authorization } } as unknown as Request;
}

test("makeAuthGuard deja pasar un token válido de una cuenta no bloqueada", async () => {
  const guard = makeAuthGuard(makeTokens({ userId: "user-1", role: "admin" }), makeUsers(makeUser()));
  const req = makeReq("Bearer valid-token");
  let nextError: unknown = "not-called";

  await guard(req, {} as Response, (err?: unknown) => {
    nextError = err;
  });

  assert.equal(nextError, undefined);
  assert.equal(req.userId, "user-1");
  assert.equal(req.userRole, "admin");
});

test("makeAuthGuard rechaza un token de una cuenta bloqueada (AZ-054)", async () => {
  const guard = makeAuthGuard(
    makeTokens({ userId: "user-1", role: "admin" }),
    makeUsers(makeUser({ isBlocked: true })),
  );
  const req = makeReq("Bearer valid-token");
  let nextError: unknown;

  await guard(req, {} as Response, (err?: unknown) => {
    nextError = err;
  });

  assert.ok(nextError instanceof UnauthorizedError);
});

test("makeAuthGuard rechaza un token cuya cuenta ya no existe", async () => {
  const guard = makeAuthGuard(makeTokens({ userId: "user-1", role: "admin" }), makeUsers(null));
  const req = makeReq("Bearer valid-token");
  let nextError: unknown;

  await guard(req, {} as Response, (err?: unknown) => {
    nextError = err;
  });

  assert.ok(nextError instanceof UnauthorizedError);
});

test("makeAuthGuard rechaza una request sin header Authorization", async () => {
  const guard = makeAuthGuard(makeTokens(null), makeUsers(makeUser()));
  const req = makeReq(undefined);
  let nextError: unknown;

  await guard(req, {} as Response, (err?: unknown) => {
    nextError = err;
  });

  assert.ok(nextError instanceof UnauthorizedError);
});
