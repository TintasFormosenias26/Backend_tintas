import assert from "node:assert/strict";
import test from "node:test";
import { ResetPassword } from "./ResetPassword.Service";
import type { ResetTokenStore } from "../../../Token/MongoRepository/TokenMongo";

class OneUseTokenStore implements ResetTokenStore {
  used = false;
  constructor(private readonly valid = true) {}
  async createToken() { return "unused"; }
  async consumeToken() {
    if (!this.valid || this.used) return null;
    this.used = true;
    return "user@example.com";
  }
}

const user = { id: "user-1", email: "user@example.com", password: "hash" } as never;
const finder = { findByEmail: async () => user };
const updater = { updateUSer: async () => ({ id: "user-1" }) };

test("el token de recuperación se consume una sola vez", async () => {
  const service = new ResetPassword(finder, updater as never, new OneUseTokenStore());
  assert.equal((await service.resertPassword("valid-token", "NewPassword123")).success, true);
  assert.equal((await service.resertPassword("valid-token", "NewPassword123")).success, false);
});

test("un token expirado o inválido no cambia la contraseña", async () => {
  let updated = false;
  const service = new ResetPassword(finder, { updateUSer: async () => { updated = true; return null; } } as never, new OneUseTokenStore(false));
  assert.equal((await service.resertPassword("expired-token", "NewPassword123")).success, false);
  assert.equal(updated, false);
});
