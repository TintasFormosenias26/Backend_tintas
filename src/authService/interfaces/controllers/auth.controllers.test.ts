import assert from "node:assert/strict";
import test from "node:test";
import { completeLogin } from "./auth.controllers";

test("login configura cookie segura y no devuelve el JWT en el body", () => {
  const state: { cookie?: { name: string; value: string; options: Record<string, unknown> }; body?: Record<string, unknown> } = {};
  const response = {
    cookie(name: string, value: string, options: Record<string, unknown>) { state.cookie = { name, value, options }; return this; },
    status() { return this; },
    json(body: Record<string, unknown>) { state.body = body; return this; },
  };
  completeLogin(response as never, "secret-jwt");
  assert.equal(state.cookie?.options.httpOnly, true);
  assert.equal(state.cookie?.options.secure, true);
  assert.equal("token" in (state.body ?? {}), false);
});
