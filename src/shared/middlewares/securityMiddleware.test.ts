import assert from "node:assert/strict";
import test from "node:test";
import { createRequestOriginValidator } from "./csrf";
import { MemoryRateLimitStore, rateLimit } from "./rateLimit";

function responseRecorder() {
  const state = { status: 200, body: undefined as unknown };
  return {
    state,
    response: {
      status(code: number) { state.status = code; return this; },
      json(body: unknown) { state.body = body; return this; },
      setHeader() {},
    },
  };
}

test("CSRF acepta un origen declarado y rechaza un origen externo", () => {
  const middleware = createRequestOriginValidator({ origins: ["https://test.example.invalid"], allowOriginless: false });
  let nextCalled = false;
  const allowed = responseRecorder();
  middleware({ method: "POST", get: () => "https://test.example.invalid", cookies: { token: "x" } } as never, allowed.response as never, () => { nextCalled = true; });
  assert.equal(nextCalled, true);

  const denied = responseRecorder();
  middleware({ method: "POST", get: () => "https://evil.example", cookies: { token: "x" } } as never, denied.response as never, () => undefined);
  assert.equal(denied.state.status, 403);
});

test("rate limiting responde 429 sin bloquear otras claves", () => {
  const middleware = rateLimit({ name: "test", windowMs: 60_000, max: 1, store: new MemoryRateLimitStore() });
  const request = { ip: "127.0.0.1", body: {} } as never;
  middleware(request, responseRecorder().response as never, () => undefined);
  const limited = responseRecorder();
  middleware(request, limited.response as never, () => undefined);
  assert.equal(limited.state.status, 429);

  let otherAllowed = false;
  middleware({ ip: "127.0.0.2", body: {} } as never, responseRecorder().response as never, () => { otherAllowed = true; });
  assert.equal(otherAllowed, true);
});
