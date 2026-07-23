// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import net from "net";
import { TestEnrollmentConnectionUseCase } from "./test-enrollment-connection.usecase";

function makeCode(url: string, port: number, token = "irrelevant-token"): string {
  return Buffer.from(JSON.stringify({ url, port, token })).toString("base64url");
}

function listenOnEphemeralPort(): Promise<{ server: net.Server; port: number }> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: (server.address() as net.AddressInfo).port });
    });
  });
}

test("TestEnrollmentConnectionUseCase rechaza un código con formato inválido", async () => {
  const useCase = new TestEnrollmentConnectionUseCase();
  await assert.rejects(() => useCase.execute({ code: "no-es-base64url-json-valido" }));
});

test("TestEnrollmentConnectionUseCase rechaza un código sin puerto (formato anterior)", async () => {
  const useCase = new TestEnrollmentConnectionUseCase();
  const code = Buffer.from(JSON.stringify({ url: "https://example.com", token: "t" })).toString("base64url");
  await assert.rejects(() => useCase.execute({ code }));
});

test("TestEnrollmentConnectionUseCase prueba la URL y el puerto de federación en paralelo, reportando cada uno por separado", async () => {
  const { server: urlServer, port: urlPort } = await listenOnEphemeralPort();
  const { server: fedServer, port: fedPort } = await listenOnEphemeralPort();
  await new Promise<void>((resolve) => fedServer.close(() => resolve())); // puerto de federación "cerrado"

  try {
    const useCase = new TestEnrollmentConnectionUseCase();
    const code = makeCode(`http://127.0.0.1:${urlPort}`, fedPort);
    const result = await useCase.execute({ code });

    assert.equal(result.urlReachable, true);
    assert.equal(result.federationPort, fedPort);
    assert.equal(result.portReachable, false);
    assert.ok(result.portError && result.portError.length > 0);
  } finally {
    urlServer.close();
  }
});
