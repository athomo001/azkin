// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { Request, Response } from "express";
import { UserController } from "./user.controller";
import { IUserRepository } from "../../../application/ports/repositories/user-repository";
import { IPasswordHasher } from "../../../application/ports/services/security";
import { IAuditLogRepository, RecordAuditLogData } from "../../../application/ports/repositories/audit-log-repository";
import { IUser } from "../../../domain/entities/user";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../../domain/errors/domain-error";
import { errorHandler } from "../middlewares/error-handler";

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    id: "user-1",
    email: "someone@azkin.test",
    passwordHash: "old-hash",
    role: "admin",
    permissions: [],
    preferences: { themeMode: null },
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
  // usersRepo/hasher/auditLog/listThemeModes — los métodos bajo prueba
  // (resetAdminPassword/changeOwnPassword) no los usan, así que se pasan stubs vacíos sin tipar.
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
    {} as never,
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

  // AZ-053 + fix de bug: el controller lanza NotFoundError (en vez de escribir la respuesta a
  // mano) para que errorHandler la traduzca al envelope real `{error:{code,message}}` — antes
  // devolvía `{error: "string"}`, que el frontend no sabía leer (mostraba siempre el mensaje
  // genérico de fallback, dando la sensación de que "no pasaba nada").
  await assert.rejects(() => controller.resetAdminPassword(req, res), NotFoundError);
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

  await assert.rejects(() => controller.changeOwnPassword(req, res), ValidationError);
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

  await assert.rejects(() => controller.changeOwnPassword(req, res), UnauthorizedError);
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

test("bug real reportado: una contraseña sin número/letra ya llega al frontend con el mensaje real, no el genérico de fallback", async () => {
  // Antes de este fix, resetAdminPassword/changeOwnPassword/changeViewerPassword respondían con
  // `res.json({ error: "mensaje" })` a mano — un envelope distinto al que produce `errorHandler`
  // para el resto de la API (`{ error: { code, message } }`). El frontend (`extractApiErrorMessage`)
  // solo sabe leer este último, así que cualquier rechazo de estos 3 endpoints mostraba siempre el
  // toast genérico ("Error al cambiar contraseña.") sin explicar el motivo real — de ahí el reporte
  // "el botón no funciona, nunca sé si cambió la clave". Este test reproduce el flujo completo
  // controller → errorHandler → JSON final, como lo vería el navegador.
  const viewer = makeUser({ id: "viewer-1", role: "viewer", adminId: "admin-1" });
  const usersRepo: IUserRepository = {
    findViewerById: async () => viewer,
  } as unknown as IUserRepository;
  const hasher: IPasswordHasher = { hash: async (p) => p, compare: async () => true };
  const { auditLog } = makeAuditLogSpy();

  const controller = makeController(usersRepo, hasher, auditLog);
  const req = {
    userId: "admin-1",
    params: { id: "viewer-1" },
    body: { newPassword: "12345678" }, // 8 caracteres, pasa el viejo check de longitud, pero sin letra
  } as unknown as Request;
  const res = makeRes();

  let caught: unknown;
  try {
    await controller.changeViewerPassword(req, res);
  } catch (err) {
    caught = err;
  }
  assert.ok(caught instanceof ValidationError);

  errorHandler(caught, req, res, () => undefined);

  assert.equal(res.statusCode, 400);
  const body = res.body as { error: { code: string; message: string } };
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.match(body.error.message, /letra.*número|número.*letra/);
});
