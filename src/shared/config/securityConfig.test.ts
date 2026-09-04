import assert from "node:assert/strict";
import test from "node:test";
import { parseEnv } from "./configEnv";
import { authCookieOptions } from "./authCookie";

test("un entorno sin secreto seguro impide iniciar", () => {
  assert.throws(() => parseEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost/test",
    JWT_SECRET: "short",
    CORS_ALLOWED_ORIGINS: "https://test.example.invalid",
    CLOUD_NAME: "test", API_KEY: "test", API_SECRET: "test", API_RENDER: "test",
  }), /JWT_SECRET/);
});

test("la cookie autenticada usa atributos seguros en TEST", () => {
  const options = authCookieOptions();
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.path, "/");
  assert.equal(options.maxAge, 3_600_000);
});
