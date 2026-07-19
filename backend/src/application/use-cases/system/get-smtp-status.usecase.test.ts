// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { GetSmtpStatusUseCase } from "./get-smtp-status.usecase";

test("GetSmtpStatusUseCase reporta no configurado si falta host o usuario", () => {
  const useCase = new GetSmtpStatusUseCase();
  const result = useCase.execute({ port: 587, secure: false });
  assert.deepEqual(result, { configured: false });
});

test("GetSmtpStatusUseCase reporta host/puerto pero nunca la contraseña", () => {
  const useCase = new GetSmtpStatusUseCase();
  const result = useCase.execute({ host: "smtp.azkin.io", port: 587, secure: true, user: "alertas@azkin.io" });
  assert.equal(result.configured, true);
  assert.equal(result.host, "smtp.azkin.io");
  assert.equal(result.port, 587);
  assert.equal((result as any).password, undefined);
  assert.equal((result as any).user, undefined);
});
