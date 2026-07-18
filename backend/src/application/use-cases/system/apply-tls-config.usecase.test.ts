// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ApplyTlsConfigUseCase } from "./apply-tls-config.usecase";
import { ITlsConfigRepository } from "../../ports/repositories/tls-config-repository";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { ITlsServerManager } from "../../ports/services/tls-server-manager";
import { ValidationError } from "../../../domain/errors/domain-error";

function makeFakes() {
  const tlsConfigs: ITlsConfigRepository = {
    getActive: async () => null,
    upsert: async (data) => ({
      id: "tls-1",
      certPem: data.certPem,
      keyPemEncrypted: data.keyPemEncrypted,
      chainPem: data.chainPem,
      port: data.port,
      httpRedirect: data.httpRedirect,
      updatedAt: new Date(),
      updatedById: data.updatedById,
    }),
  };
  const auditLog: IAuditLogRepository = {
    record: async (data) => ({ id: "audit-1", createdAt: new Date(), ...data }),
    listRecent: async () => [],
  };
  const tlsServerManager: ITlsServerManager = {
    reload: async () => undefined,
    getStatus: () => ({ active: false, httpRedirect: false }),
    stop: () => undefined,
  };
  return { tlsConfigs, auditLog, tlsServerManager };
}

test("ApplyTlsConfigUseCase rechaza un certificado con formato PEM inválido", async () => {
  const { tlsConfigs, auditLog, tlsServerManager } = makeFakes();
  const useCase = new ApplyTlsConfigUseCase(
    tlsConfigs,
    auditLog,
    tlsServerManager,
    (pem) => pem,
    "0".repeat(64),
  );

  await assert.rejects(
    () =>
      useCase.execute({
        actorId: "admin-1",
        certPem: "no-es-un-certificado-valido",
        keyPem: "no-es-una-clave-valida",
        port: 8443,
        httpRedirect: false,
      }),
    ValidationError,
  );
});
