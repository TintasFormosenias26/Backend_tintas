import assert from "node:assert/strict";
import test from "node:test";
import { isCorsOriginAllowed, readinessHandler } from "./app";
import { errorHandler, notFoundHandler, sendError } from "./shared/middlewares/errorHandler";

function responseDouble() {
  const state = { status: 200, body: undefined as unknown };
  const response = {
    locals: { requestId: "req-test" },
    status(code: number) { state.status = code; return this; },
    json(body: unknown) { state.body = body; return this; },
  };
  return { state, response };
}

test("CORS acepta orígenes permitidos y rechaza otros", () => {
  assert.equal(isCorsOriginAllowed("https://test.example.invalid"), true);
  assert.equal(isCorsOriginAllowed("https://evil.example"), false);
  assert.equal(isCorsOriginAllowed(), true);
});

test("readiness devuelve 503 cuando PostgreSQL no está disponible", async () => {
  const state = { status: 200, body: undefined as unknown };
  const response = {
    status(code: number) { state.status = code; return this; },
    json(body: unknown) { state.body = body; return this; },
  };
  await readinessHandler(async () => { throw new Error("db unavailable"); })({} as never, response as never);
  assert.equal(state.status, 503);
  assert.deepEqual(state.body, { status: "unavailable" });
});

test("errores usan un contrato uniforme con requestId", () => {
  const { state, response } = responseDouble();
  sendError(response as never, 403, "FORBIDDEN", "Acceso denegado.");
  assert.equal(state.status, 403);
  assert.deepEqual(state.body, {
    success: false,
    error: { code: "FORBIDDEN", message: "Acceso denegado.", requestId: "req-test" },
    code: "FORBIDDEN",
    message: "Acceso denegado.",
    requestId: "req-test",
  });
});

test("rutas inexistentes no exponen detalles técnicos", () => {
  const { state, response } = responseDouble();
  notFoundHandler({} as never, response as never);
  assert.equal(state.status, 404);
  assert.equal((state.body as { error: { code: string } }).error.code, "RESOURCE_NOT_FOUND");
});

test("errores Prisma duplicados se convierten en conflicto seguro", () => {
  const { state, response } = responseDouble();
  errorHandler({ code: "P2002", meta: { target: "email" } }, {} as never, response as never, (() => undefined) as never);
  assert.equal(state.status, 409);
  const body = state.body as { error: { code: string; message: string } };
  assert.equal(body.error.code, "RESOURCE_CONFLICT");
  assert.equal(body.error.message, "El registro ya existe.");
  assert.equal(JSON.stringify(body).includes("email"), false);
});
