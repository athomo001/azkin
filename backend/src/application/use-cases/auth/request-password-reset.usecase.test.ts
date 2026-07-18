// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { RequestPasswordResetUseCase } from "./request-password-reset.usecase";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IMailer } from "../../ports/services/mailer";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

test("RequestPasswordResetUseCase no envía correo ni falla si el email no existe (anti-enumeración)", async () => {
  let mailSent = false;
  const users: IUserRepository = {
    create: async () => {
      throw new Error("no usado");
    },
    findByEmail: async () => null,
    findByIdentifier: async () => null,
    findById: async () => null,
    changePassword: async () => true,
    countAdmins: async () => 1,
    setPasswordResetToken: async () => undefined,
    findByValidResetTokenHash: async () => null,
    clearPasswordResetToken: async () => undefined,
    createViewer: async () => {
      throw new Error("no usado");
    },
    findAllViewers: async () => [],
    findViewerById: async () => null,
    updateViewerPermissions: async () => null,
    deleteViewer: async () => true,
    updatePreferences: async () => undefined,
  };
  const mailer: IMailer = {
    send: async () => {
      mailSent = true;
    },
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
  };

  const useCase = new RequestPasswordResetUseCase(users, mailer, auditLog);
  await useCase.execute({ email: "no-existe@azkin.test" });

  assert.equal(mailSent, false);
});
