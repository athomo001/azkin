// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { Request, Response } from "express";
import { UserController } from "./user.controller";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";
import { IPasswordHasher } from "../../../application/ports/services/security";
import { IAuditLogRepository, RecordAuditLogData } from "../../../application/ports/repositories/audit-log-repository";
import { IUser } from "../../../domain/entities/user";

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    id: "user-1",
    email: "someone@azkin.test",
    passwordHash: "old-hash",
    role: "admin",
    permissions: [],
    preferences: { nyanCatMode: false },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeAuditLogSpy(): { auditLog: IAuditLogRepository; calls: RecordAuditLogData[] } {
  const calls: RecordAuditLogData[] = [];
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      calls.push(data);
      return { id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data } as never;
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { auditLog, calls };
}

function makeRes(): Response & { statusCode?: number; body?: unknown } {
  const res = {} as Response & { statusCode?: number; body?: unknown };
  res.status = ((code: number) => {
    res.statusCode = code;
    return res;
  }) as Response["status"];
  res.json = ((body: unknown) => {
    res.body = body;
    return res;
  }) as Response["json"];
  res.send = (() => res) as Response["send"];
  return res;
}

function makeController(usersRepo: IUserRepository, hasher: IPasswordHasher, auditLog: IAuditLogRepository): UserController {
  // El controller declara 9 use-cases de Viewer/Admin en su constructor además de
  // usersRepo/hasher/auditLog — los métodos bajo prueba (resetAdminPassword/changeOwnPassword) no
  // los usan, así que se pasan stubs vacíos sin tipar.
  return new UserController(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    usersRepo,
    hasher,
    auditLog,
  );
}

test("resetAdminPassword devuelve 404 si el id objetivo no es un Admin (AZ-053)", async () => {
  const viewer = makeUser({ id: "viewer-1", role: "viewer", adminId: "other-admin" });
  const usersRepo: IUserRepository = {
    findById: async () => viewer,
    changePassword: async () => true,
  } as unknown as IUserRepository;
  const hasher: IPasswordHasher = { hash: async (p) => p, compare: async () => true };
  const { auditLog, calls } = makeAuditLogSpy();

  const controller = makeController(usersRepo, hasher, auditLog);
  const req = { params: { id: "viewer-1" }, body: { newPassword: "nuevaPass123" }, userId: "admin-actor" } as unknown as Request;
  const res = makeRes();

  await controller.resetAdminPassword(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(calls.length, 0, "no debe auditar un reset que en realidad no ocurrió");
});

test("resetAdminPassword aplica el cambio si el id objetivo es un Admin real", async () => {
  const admin = makeUser({ id: "admin-2", role: "admin" });
  const usersRepo: IUserRepository = {
    findById: async () => admin,
    changePassword: async () => true,
  } as unknown as IUserRepository;
  const hasher: IPasswordHasher = { hash: async (p) => p, compare: async () => true };
  const { auditLog, calls } = makeAuditLogSpy();

  const controller = makeController(usersRepo, hasher, auditLog);
  const req = { params: { id: "admin-2" }, body: { newPassword: "nuevaPass123" }, userId: "admin-actor" } as unknown as Request;
  const res = makeRes();

  await controller.resetAdminPassword(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "ADMIN_PASSWORD_RESET");
});

test("changeOwnPassword rechaza sin currentPassword", async () => {
  const user = makeUser();
  const usersRepo: IUserRepository = { findById: async () => user } as unknown as IUserRepository;
  const hasher: IPasswordHasher = { hash: async (p) => p, compare: async () => true };
  const { auditLog, calls } = makeAuditLogSpy();

  const controller = makeController(usersRepo, hasher, auditLog);
  const req = { userId: "user-1", body: { newPassword: "nuevaPass123" } } as unknown as Request;
  const res = makeRes();

  await controller.changeOwnPassword(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
});

test("changeOwnPassword rechaza con currentPassword incorrecta (401, AZ-057)", async () => {
  const user = makeUser();
  const usersRepo: IUserRepository = { findById: async () => user } as unknown as IUserRepository;
  const hasher: IPasswordHasher = { hash: async (p) => p, compare: async () => false };
  const { auditLog, calls } = makeAuditLogSpy();

  const controller = makeController(usersRepo, hasher, auditLog);
  const req = { userId: "user-1", body: { currentPassword: "incorrecta", newPassword: "nuevaPass123" } } as unknown as Request;
  const res = makeRes();

  await controller.changeOwnPassword(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(calls.length, 0);
});

test("changeOwnPassword aplica el cambio y audita cuando currentPassword es correcta", async () => {
  const user = makeUser();
  let changedTo: string | undefined;
  const usersRepo: IUserRepository = {
    findById: async () => user,
    changePassword: async (_id: string, hash: string) => {
      changedTo = hash;
      return true;
    },
  } as unknown as IUserRepository;
  const hasher: IPasswordHasher = { hash: async (p) => `hashed:${p}`, compare: async () => true };
  const { auditLog, calls } = makeAuditLogSpy();

  const controller = makeController(usersRepo, hasher, auditLog);
  const req = { userId: "user-1", body: { currentPassword: "actual123", newPassword: "nuevaPass123" } } as unknown as Request;
  const res = makeRes();

  await controller.changeOwnPassword(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(changedTo, "hashed:nuevaPass123");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "OWN_PASSWORD_CHANGE");
});
