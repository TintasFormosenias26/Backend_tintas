-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "ProgressUnit" AS ENUM ('PAGE', 'PAGES', 'SECOND', 'SECONDS');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('READING', 'FINISHED', 'PENDING');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('INICIAL', 'SECUNDARIO', 'JOVEN_ADULTO', 'ADULTO_MAYOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nivel" TEXT,
    "imgLevel" TEXT,
    "rol" "Role" NOT NULL DEFAULT 'USER',
    "point" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categories" TEXT[],
    "formats" TEXT[],

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "unit" "ProgressUnit" NOT NULL,
    "position" INTEGER NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'READING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "finishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookContent" (
    "id" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "BookContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "birthplace" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "isActivo" BOOLEAN NOT NULL,
    "writingGenre" TEXT[],
    "photoIdImage" TEXT NOT NULL,
    "photorUrl" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "yearBook" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "format" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "totalPages" INTEGER,
    "duration" INTEGER,
    "anthology" BOOLEAN NOT NULL DEFAULT false,
    "contentBookId" TEXT NOT NULL,
    "contentBookUrl" TEXT NOT NULL,
    "coverImageId" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "theme" TEXT[],
    "subgenre" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "idImage" TEXT NOT NULL,
    "urlSecura" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuthorToBook" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuthorToBook_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Preference_userId_key" ON "Preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "book_progress_userId_bookId_key" ON "book_progress"("userId", "bookId");

-- CreateIndex
CREATE INDEX "_AuthorToBook_B_index" ON "_AuthorToBook"("B");

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_progress" ADD CONSTRAINT "book_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_progress" ADD CONSTRAINT "book_progress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookContent" ADD CONSTRAINT "BookContent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToBook" ADD CONSTRAINT "_AuthorToBook_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToBook" ADD CONSTRAINT "_AuthorToBook_B_fkey" FOREIGN KEY ("B") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
