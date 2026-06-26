/*
  Warnings:

  - You are about to drop the column `itActivo` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `photorUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `writingGenre` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the `BookContent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isActivo` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photoUrl` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BookContent" DROP CONSTRAINT "BookContent_bookId_fkey";

-- AlterTable
ALTER TABLE "Author" DROP COLUMN "itActivo",
DROP COLUMN "photorUrl",
DROP COLUMN "writingGenre",
ADD COLUMN     "isActivo" BOOLEAN NOT NULL,
ADD COLUMN     "photoUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "level" "Level" NOT NULL;

-- DropTable
DROP TABLE "BookContent";
