// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DeleteFederatedInstanceUseCase } from "./delete-federated-instance.usecase";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";
import { NotFoundError } from "../../../domain/errors/domain-error";

function makeInstance(): IFederatedInstance {
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
  };
}

test("DeleteFederatedInstanceUseCase elimina la instancia y sus vínculos", async () => {
  const instance = makeInstance();
  let deletedLinksForInstance = "";
  let deletedInstanceId = "";

  const fakeInstancesRepo = {
    findById: async (id: string) => (id === instance.id ? instance : null),
    delete: async (id: string) => {
      deletedInstanceId = id;
      return true;
    },
  } as any;

  const fakeLinksRepo = {
    deleteByFederatedInstanceId: async (id: string) => {
      deletedLinksForInstance = id;
      return 2;
    },
  } as any;

  const fakeAudit = { record: async () => {} } as any;

  const useCase = new DeleteFederatedInstanceUseCase(fakeInstancesRepo, fakeLinksRepo, fakeAudit);
  await useCase.execute("user-1", instance.id);

  assert.equal(deletedLinksForInstance, instance.id);
  assert.equal(deletedInstanceId, instance.id);
});

test("DeleteFederatedInstanceUseCase lanza NotFoundError si no existe", async () => {
  const fakeInstancesRepo = { findById: async () => null } as any;
  const fakeLinksRepo = { deleteByFederatedInstanceId: async () => 0 } as any;

  const useCase = new DeleteFederatedInstanceUseCase(fakeInstancesRepo, fakeLinksRepo, { record: async () => {} } as any);
  await assert.rejects(
    () => useCase.execute("user-1", "nonexistent"),
    (err: any) => err instanceof NotFoundError,
  );
});
