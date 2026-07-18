// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { Request, Response } from "express";
import { requireRole } from "./require-role";
import { ForbiddenError } from "../../../domain/errors/domain-error";

function fakeReq(userRole?: string): Request {
  return { userRole } as unknown as Request;
}

test("requireRole bloquea con ForbiddenError cuando el rol no está permitido", () => {
  const middleware = requireRole("admin");
  let calledWith: unknown;
  middleware(fakeReq("viewer"), {} as Response, (err?: unknown) => {
    calledWith = err;
  });
  assert.ok(calledWith instanceof ForbiddenError);
});

test("requireRole permite continuar cuando el rol coincide", () => {
  const middleware = requireRole("admin");
  let calledWith: unknown = "not-called";
  middleware(fakeReq("admin"), {} as Response, (err?: unknown) => {
    calledWith = err;
  });
  assert.equal(calledWith, undefined);
});
