// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import net from "net";
import { checkTcpReachability } from "./check-tcp-reachability";

function listenOnEphemeralPort(): Promise<{ server: net.Server; port: number }> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: (server.address() as net.AddressInfo).port });
    });
  });
}

test("checkTcpReachability reporta reachable=true y una latencia cuando el puerto está escuchando", async () => {
  const { server, port } = await listenOnEphemeralPort();
  try {
    const result = await checkTcpReachability("127.0.0.1", port);
    assert.equal(result.reachable, true);
    assert.equal(typeof result.latencyMs, "number");
    assert.equal(result.error, undefined);
  } finally {
    server.close();
  }
});

test("checkTcpReachability reporta reachable=false con el error real cuando la conexión es rechazada", async () => {
  const { server, port } = await listenOnEphemeralPort();
  await new Promise<void>((resolve) => server.close(() => resolve())); // libera el puerto sin nadie escuchando

  const result = await checkTcpReachability("127.0.0.1", port);
  assert.equal(result.reachable, false);
  assert.ok(result.error && result.error.length > 0);
});
