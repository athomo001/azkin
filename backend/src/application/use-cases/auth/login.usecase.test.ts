// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { LoginUseCase } from "./login.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IPasswordHasher, ITokenService } from "../../ports/services/security";
import { IAuditLogRepository, RecordAuditLogData } from "../../ports/repositories/audit-log-repository";
import { IUser } from "../../../domain/entities/user";
import { IAuditLog } from "../../../domain/entities/audit-log";

function makeViewer(overrides: Partial<IUser> = {}): IUser {
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
    ...overrides,
  };
}

function makeUsers(user: IUser | null): IUserRepository {
  return {
    create: async () => user as IUser,
    findByEmail: async () => user,
    findByIdentifier: async () => user,
    findById: async () => user,
    changePassword: async () => true,
    createViewer: async () => user as IUser,
    findAllViewers: async () => (user ? [user] : []),
    findViewerById: async () => user,
    updateViewerPermissions: async () => user as IUser,
    deleteViewer: async () => true,
    updatePreferences: async () => undefined,
  };
}

function makeHasher(matches: boolean): IPasswordHasher {
  return {
    hash: async (plain: string) => plain,
    compare: async () => matches,
  };
}

function makeTokens(): { tokens: ITokenService; signedWith: unknown[] } {
  const signedWith: unknown[] = [];
  const tokens: ITokenService = {
    sign: (...args: unknown[]) => {
      signedWith.push(args);
      return "fake-jwt";
    },
    verify: () => ({ userId: "viewer-1", role: "viewer" }),
  };
  return { tokens, signedWith };
}

function makeAuditLogSpy(): { auditLog: IAuditLogRepository; calls: RecordAuditLogData[] } {
  const calls: RecordAuditLogData[] = [];
  const auditLog: IAuditLogRepository = {
    record: async (data) => {
      calls.push(data);
      return { id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data } as IAuditLog;
    },
    listRecent: async () => [],
    listAll: async () => [],
    deleteAll: async () => 0,
  };
  return { auditLog, calls };
}

test("LoginUseCase pasa los permisos del usuario al firmar el token", async () => {
  const viewer = makeViewer();
  const { tokens, signedWith } = makeTokens();
  const { auditLog } = makeAuditLogSpy();

  const useCase = new LoginUseCase(makeUsers(viewer), makeHasher(true), tokens, auditLog);
  await useCase.execute({ identifier: viewer.email!, password: "whatever" });

  assert.deepEqual(signedWith[0]?.[3], viewer.permissions, "el 4º argumento de sign() debe ser permissions del usuario");
});

test("LoginUseCase registra LOGIN_SUCCESS con el actorId del usuario tras un login correcto", async () => {
  const viewer = makeViewer();
  const { tokens } = makeTokens();
  const { auditLog, calls } = makeAuditLogSpy();

  const useCase = new LoginUseCase(makeUsers(viewer), makeHasher(true), tokens, auditLog);
  await useCase.execute({ identifier: viewer.email!, password: "correcta" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "LOGIN_SUCCESS");
  assert.equal(calls[0].actorId, viewer.id);
});

test("LoginUseCase registra LOGIN_FAILED con actorId nulo cuando el identificador no existe", async () => {
  const { tokens } = makeTokens();
  const { auditLog, calls } = makeAuditLogSpy();

  const useCase = new LoginUseCase(makeUsers(null), makeHasher(false), tokens, auditLog);
  await assert.rejects(() => useCase.execute({ identifier: "nadie@azkin.test", password: "loquesea" }));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "LOGIN_FAILED");
  assert.equal(calls[0].actorId, null);
  assert.equal(calls[0].metadata?.reason, "unknown_identifier");
  assert.equal(calls[0].metadata?.attemptedIdentifier, "nadie@azkin.test");
});

test("LoginUseCase registra LOGIN_FAILED con el actorId del usuario cuando la contraseña es incorrecta", async () => {
  const viewer = makeViewer();
  const { tokens } = makeTokens();
  const { auditLog, calls } = makeAuditLogSpy();

  const useCase = new LoginUseCase(makeUsers(viewer), makeHasher(false), tokens, auditLog);
  await assert.rejects(() => useCase.execute({ identifier: viewer.email!, password: "incorrecta" }));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "LOGIN_FAILED");
  assert.equal(calls[0].actorId, viewer.id);
  assert.equal(calls[0].metadata?.reason, "wrong_password");
});

test("LoginUseCase registra LOGIN_BLOCKED cuando la cuenta está bloqueada", async () => {
  const viewer = makeViewer({ isBlocked: true });
  const { tokens } = makeTokens();
  const { auditLog, calls } = makeAuditLogSpy();

  const useCase = new LoginUseCase(makeUsers(viewer), makeHasher(true), tokens, auditLog);
  await assert.rejects(() => useCase.execute({ identifier: viewer.email!, password: "correcta" }));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "LOGIN_BLOCKED");
  assert.equal(calls[0].actorId, viewer.id);
});
