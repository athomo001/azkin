// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { Request, Response } from "express";
import { licenseNotice } from "./license-notice";

function fakeRes(): { res: Response; headers: Record<string, string> } {
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
  } as unknown as Response;
  return { res, headers };
}

test("licenseNotice adjunta los headers de licencia y continúa la cadena", () => {
  const { res, headers } = fakeRes();
  let nextCalled = false;

  licenseNotice({} as Request, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(headers["X-License"], "SSPL-1.0");
  assert.match(headers["X-License-Notice"], /Licencia Comercial/);
});
