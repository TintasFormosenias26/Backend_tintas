import assert from "node:assert/strict";
import test from "node:test";
import { declaredFileIsAllowed, fileSizeIsAllowed, signatureMatches } from "./secureUpload";

test("upload rechaza extensión falsa y MIME inválido", () => {
  assert.equal(declaredFileIsAllowed({ originalname: "payload.exe", mimetype: "image/png" }, "image"), false);
  assert.equal(declaredFileIsAllowed({ originalname: "image.png", mimetype: "application/javascript" }, "image"), false);
});

test("upload rechaza archivos que superan el límite configurado", () => {
  assert.equal(fileSizeIsAllowed(1, "image"), true);
  assert.equal(fileSizeIsAllowed(Number.MAX_SAFE_INTEGER, "image"), false);
  assert.equal(fileSizeIsAllowed(-1, "book"), false);
});

test("upload valida firmas reales de imagen y PDF", () => {
  assert.equal(signatureMatches(Buffer.from("89504e470d0a1a0a0000000000000000", "hex"), "image", "image/png"), true);
  assert.equal(signatureMatches(Buffer.from("not-a-real-pdf!!"), "book", "application/pdf"), false);
  assert.equal(signatureMatches(Buffer.from("%PDF-1.7 content"), "book", "application/pdf"), true);
});
