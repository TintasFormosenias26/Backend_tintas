/*
  Warnings:

  - The values [MODERATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "rol" TYPE "Role_new" USING ("rol"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "rol" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
