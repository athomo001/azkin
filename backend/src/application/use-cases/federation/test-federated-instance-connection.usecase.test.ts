// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import net from "net";
import { TestFederatedInstanceConnectionUseCase } from "./test-federated-instance-connection.usecase";
import { IFederatedInstanceRepository } from "../../ports/repositories/federated-instance-repository";
import { IFederatedInstance } from "../../../domain/entities/federated-instance";

function listenOnEphemeralPort(): Promise<{ server: net.Server; port: number }> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: (server.address() as net.AddressInfo).port });
    });
  });
}

function makeInstance(overrides: Partial<IFederatedInstance> = {}): IFederatedInstance {
  return {
    id: "instance-1",
    label: "China-VPS1",
    remoteUrl: "http://127.0.0.1:1",
    remoteFederationPort: 1,
    peerCertFingerprint: "aa:bb",
    status: "enrolled",
    createdById: "admin-1",
    createdAt: new Date(),
    revokedAt: null,
    lastSuccessfulSyncAt: null,
    notifiedDown: false,
    ...overrides,
  };
}

function makeRepo(instance: IFederatedInstance | null): IFederatedInstanceRepository {
  return {
    create: async () => instance!,
    findAll: async () => (instance ? [instance] : []),
    findById: async () => instance,
    countActive: async () => (instance ? 1 : 0),
    revoke: async () => instance,
    findEnrolledByFingerprint: async () => instance,
    findAllActive: async () => (instance ? [instance] : []),
    markSyncSuccess: async () => {},
    setNotifiedDown: async () => {},
  };
}

test("TestFederatedInstanceConnectionUseCase lanza NotFoundError si la instancia no existe", async () => {
  const useCase = new TestFederatedInstanceConnectionUseCase(makeRepo(null));
  await assert.rejects(() => useCase.execute("no-existe"));
});

test("TestFederatedInstanceConnectionUseCase prueba la URL y el puerto de federación guardados en la instancia", async () => {
  const { server: urlServer, port: urlPort } = await listenOnEphemeralPort();
  try {
    const instance = makeInstance({ remoteUrl: `http://127.0.0.1:${urlPort}`, remoteFederationPort: urlPort + 1 });
    const useCase = new TestFederatedInstanceConnectionUseCase(makeRepo(instance));

    const result = await useCase.execute("instance-1");

    assert.equal(result.urlReachable, true);
    assert.equal(result.federationPort, urlPort + 1);
    assert.equal(result.portReachable, false); // nadie escucha en ese puerto
  } finally {
    urlServer.close();
  }
});
