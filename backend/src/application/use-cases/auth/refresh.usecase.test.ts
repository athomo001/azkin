// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RefreshUseCase } from "./refresh.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { ITokenService } from "../../ports/services/security";
import { IUser } from "../../../domain/entities/user";
import { AccountBlockedError, UnauthorizedError } from "../../../domain/errors/domain-error";

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    id: "user-1",
    email: "admin@azkin.test",
    passwordHash: "hashed",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeTokens(): ITokenService & { signedWith: unknown[][] } {
  const signedWith: unknown[][] = [];
  return {
    signedWith,
    sign: (...args: unknown[]) => {
      signedWith.push(args);
      return `fake-jwt-${signedWith.length}`;
    },
    verify: () => ({ userId: "user-1", role: "admin" }),
  };
}

test("RefreshUseCase emite un nuevo access token y rota el refresh token", async () => {
  const user = makeUser();
  const users: IUserRepository = {
    create: async () => user,
    findByEmail: async () => user,
    findByIdentifier: async () => user,
    findById: async () => user,
    changePassword: async () => true,
    createViewer: async () => user,
    findAllViewers: async () => [user],
    findViewerById: async () => user,
    updateViewerPermissions: async () => user,
    deleteViewer: async () => true,
    updatePreferences: async () => undefined,
  } as unknown as IUserRepository;

  const tokens = makeTokens();
  const useCase = new RefreshUseCase(users, tokens);

  const result = await useCase.execute({ token: "old-refresh-token" });

  assert.equal(result.token, "fake-jwt-1");
  assert.equal(result.refreshToken, "fake-jwt-2");
  assert.notEqual(result.token, result.refreshToken, "el access token y el refresh token deben ser distintos");
});

test("RefreshUseCase lanza AccountBlockedError si la cuenta fue bloqueada desde el último login", async () => {
  const user = makeUser({ isBlocked: true });
  const users: IUserRepository = {
    findById: async () => user,
  } as unknown as IUserRepository;

  const tokens = makeTokens();
  const useCase = new RefreshUseCase(users, tokens);

  await assert.rejects(() => useCase.execute({ token: "old-refresh-token" }), AccountBlockedError);
});

test("RefreshUseCase lanza UnauthorizedError si el usuario ya no existe", async () => {
  const users: IUserRepository = {
    findById: async () => null,
  } as unknown as IUserRepository;

  const tokens = makeTokens();
  const useCase = new RefreshUseCase(users, tokens);

  await assert.rejects(() => useCase.execute({ token: "old-refresh-token" }), UnauthorizedError);
});
