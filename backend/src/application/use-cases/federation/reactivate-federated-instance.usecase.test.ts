// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { ReactivateFederatedInstanceUseCase } from "./reactivate-federated-instance.usecase";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { NotFoundError, QuotaExceededError } from "../../../domain/errors/domain-error";

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "60f719b8f1d2c34567890abc",
    label: "China-VPS1",
    remoteUrl: "https://china.azkin.internal",
    remoteSecretEncrypted: "enc_secret",
    status: "revoked",
    createdById: "60f719b8f1d2c34567890def",
    createdAt: new Date(),
    revokedAt: new Date(),
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
    ...overrides,
  };
}

test("ReactivateFederatedInstanceUseCase reactiva una instancia revocada", async () => {
  const instance = makeInstance();
  let countActiveCall = 0;
  let reactivateCallId = "";

  const fakeInstancesRepo = {
    findById: async (id: string) => (id === instance.id ? instance : null),
    countActive: async () => {
      countActiveCall++;
      return 1;
    },
    reactivate: async (id: string) => {
      reactivateCallId = id;
      return { ...instance, status: "enrolled" as const, revokedAt: null };
    },
  } as any;

  const fakeAudit = { record: async () => {} } as any;

  const useCase = new ReactivateFederatedInstanceUseCase(fakeInstancesRepo, fakeAudit);
  const result = await useCase.execute("user-1", instance.id);

  assert.equal(reactivateCallId, instance.id);
  assert.equal(result.status, "enrolled");
  assert.equal(countActiveCall, 1);
});

test("ReactivateFederatedInstanceUseCase lanza QuotaExceededError si ya hay 5 activas", async () => {
  const instance = makeInstance();
  const fakeInstancesRepo = {
    findById: async () => instance,
    countActive: async () => 5,
  } as any;

  const useCase = new ReactivateFederatedInstanceUseCase(fakeInstancesRepo, { record: async () => {} } as any);
  await assert.rejects(
    () => useCase.execute("user-1", instance.id),
    (err: any) => err instanceof QuotaExceededError,
  );
});

test("ReactivateFederatedInstanceUseCase lanza NotFoundError si no existe", async () => {
  const fakeInstancesRepo = {
    findById: async () => null,
  } as any;

  const useCase = new ReactivateFederatedInstanceUseCase(fakeInstancesRepo, { record: async () => {} } as any);
  await assert.rejects(
    () => useCase.execute("user-1", "nonexistent"),
    (err: any) => err instanceof NotFoundError,
  );
});
