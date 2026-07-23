// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import net from "net";
import { TestAddressConnectionUseCase } from "./test-address-connection.usecase";

function listenOnEphemeralPort(): Promise<{ server: net.Server; port: number }> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: (server.address() as net.AddressInfo).port });
    });
  });
}

test("TestAddressConnectionUseCase reporta reachable=true para una IP simple", async () => {
  const { server, port } = await listenOnEphemeralPort();
  try {
    const useCase = new TestAddressConnectionUseCase();
    const result = await useCase.execute({ host: "127.0.0.1", port });
    assert.equal(result.reachable, true);
  } finally {
    server.close();
  }
});

test("TestAddressConnectionUseCase acepta una URL completa y extrae el hostname", async () => {
  const { server, port } = await listenOnEphemeralPort();
  try {
    const useCase = new TestAddressConnectionUseCase();
    const result = await useCase.execute({ host: "https://127.0.0.1/algo", port });
    assert.equal(result.reachable, true);
  } finally {
    server.close();
  }
});

test("TestAddressConnectionUseCase reporta reachable=false con el error real si nadie escucha", async () => {
  const { server, port } = await listenOnEphemeralPort();
  await new Promise<void>((resolve) => server.close(() => resolve()));

  const useCase = new TestAddressConnectionUseCase();
  const result = await useCase.execute({ host: "127.0.0.1", port });

  assert.equal(result.reachable, false);
  assert.ok(result.error);
});
