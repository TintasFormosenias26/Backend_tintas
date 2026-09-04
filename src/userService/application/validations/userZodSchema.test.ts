import assert from "node:assert/strict";
import test from "node:test";
import { UserUpdateZodSchema } from "./userZodSchema";
import { publicUserOmit, publicUserSelect } from "../../domain/entities/publicUser";

const allowedUpdate = {
  name: "Ana",
  lastName: "Pérez",
  userName: "ana_perez",
  birthDate: "1990-01-01",
  email: "ana@example.com",
};

test("el perfil admite solamente campos de la allowlist", () => {
  assert.equal(UserUpdateZodSchema.safeParse(allowedUpdate).success, true);
});

for (const forbiddenField of [
  "rol",
  "role",
  "point",
  "imgLevel",
  "password",
  "id",
  "createdAt",
  "updatedAt",
]) {
  test(`el perfil rechaza el campo interno ${forbiddenField}`, () => {
    const result = UserUpdateZodSchema.safeParse({ ...allowedUpdate, [forbiddenField]: "forbidden" });
    assert.equal(result.success, false);
  });
}

test("la proyección pública nunca selecciona password", () => {
  assert.equal("password" in publicUserSelect, false);
  assert.equal(publicUserOmit.password, true);
});
