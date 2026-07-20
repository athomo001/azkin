// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RegisterUseCase } from "./register.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { ForbiddenError } from "../../../domain/errors/domain-error";
import { IUser } from "../../../domain/entities/user";

function makeAdmin(): IUser {
  return {
    id: "admin-1",
    email: "admin@azkin.test",
    passwordHash: "hashed",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

test("RegisterUseCase rechaza el registro si ya existe un admin (auto-bootstrap)", async () => {
  const admin = makeAdmin();
  const users: IUserRepository = {
    create: async () => admin,
    findByEmail: async () => null,
    findByIdentifier: async () => null,
    findById: async () => null,
    changePassword: async () => true,
    countAdmins: async () => 1,
    setPasswordResetToken: async () => undefined,
    findByValidResetTokenHash: async () => null,
    clearPasswordResetToken: async () => undefined,
    createViewer: async () => admin,
    findAllViewers: async () => [],
    findViewerById: async () => null,
    updateViewerPermissions: async () => null,
    deleteViewer: async () => true,
    updatePreferences: async () => undefined,
  };
  const hasher: IPasswordHasher = { hash: async (p) => p, compare: async () => true };
  const tokens: ITokenService = { sign: () => "jwt", verify: () => ({ userId: "x", role: "admin" }) };

  const useCase = new RegisterUseCase(users, hasher, tokens);

  await assert.rejects(
    () => useCase.execute({ email: "nuevo@azkin.test", password: "password123" }),
    ForbiddenError,
  );
});

test("RegisterUseCase permite el registro cuando no existe ningún admin todavía", async () => {
  const admin = makeAdmin();
  const users: IUserRepository = {
    create: async () => admin,
    findByEmail: async () => null,
    findByIdentifier: async () => null,
    findById: async () => null,
    changePassword: async () => true,
    countAdmins: async () => 0,
    setPasswordResetToken: async () => undefined,
    findByValidResetTokenHash: async () => null,
    clearPasswordResetToken: async () => undefined,
    createViewer: async () => admin,
    findAllViewers: async () => [],
    findViewerById: async () => null,
    updateViewerPermissions: async () => null,
    deleteViewer: async () => true,
    updatePreferences: async () => undefined,
  };
  const hasher: IPasswordHasher = { hash: async (p) => p, compare: async () => true };
  const tokens: ITokenService = { sign: () => "jwt", verify: () => ({ userId: "x", role: "admin" }) };

  const useCase = new RegisterUseCase(users, hasher, tokens);
  const result = await useCase.execute({ email: "nuevo@azkin.test", password: "password123" });

  assert.equal(result.token, "jwt");
});
