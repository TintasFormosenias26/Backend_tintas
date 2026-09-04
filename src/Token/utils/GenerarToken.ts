import crypto from "node:crypto";

export function generateResetToken(): string {
    return crypto.randomBytes(32).toString("base64url");
}

export function hashResetToken(token: string): string {
    return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}
