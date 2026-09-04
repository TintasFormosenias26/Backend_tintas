-- Los tokens existentes quedan invalidados al aplicar la migración: se conservan,
-- pero expiran inmediatamente. No se ejecuta automáticamente desde la aplicación.
ALTER TABLE "Token" RENAME COLUMN "token" TO "tokenHash";
ALTER TABLE "Token" ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Token" ADD COLUMN "usedAt" TIMESTAMP(3);
ALTER TABLE "Token" ALTER COLUMN "expiresAt" DROP DEFAULT;
CREATE INDEX "Token_userEmail_idx" ON "Token"("userEmail");
