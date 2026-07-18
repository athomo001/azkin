// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { LoginUseCase } from "./login.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { IUser } from "../../../domain/entities/user";

function makeViewer(): IUser {
  return {
    id: "viewer-1",
    email: "viewer@azkin.test",
    passwordHash: "hashed",
    role: "viewer",
    adminId: "admin-1",
    permissions: [{ type: "group", value: "Netics" }],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

test("LoginUseCase pasa los permisos del usuario al firmar el token (regresión AZ-001)", async () => {
  const viewer = makeViewer();

  const users: IUserRepository = {
    create: async () => viewer,
    findByEmail: async () => viewer,
    findByIdentifier: async () => viewer,
    findById: async () => viewer,
    changePassword: async () => true,
    createViewer: async () => viewer,
    findAllViewers: async () => [viewer],
    findViewerById: async () => viewer,
    updateViewerPermissions: async () => viewer,
    deleteViewer: async () => true,
    updatePreferences: async () => undefined,
  };

  const hasher: IPasswordHasher = {
    hash: async (plain: string) => plain,
    compare: async () => true,
  };

  let signedWith: unknown[] = [];
  const tokens: ITokenService = {
    sign: (...args: unknown[]) => {
      signedWith = args;
      return "fake-jwt";
    },
    verify: () => ({ userId: viewer.id, role: viewer.role }),
  };

  const useCase = new LoginUseCase(users, hasher, tokens);
  await useCase.execute({ identifier: viewer.email!, password: "whatever" });

  assert.deepEqual(signedWith[3], viewer.permissions, "el 4º argumento de sign() debe ser permissions del usuario");
});
