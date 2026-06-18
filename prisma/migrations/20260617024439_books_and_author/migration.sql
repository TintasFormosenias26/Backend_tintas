-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "birthplace" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "itActivo" BOOLEAN NOT NULL,
    "writingGenre" TEXT[],
    "avatarIdImage" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,

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
    "level" TEXT NOT NULL,
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
CREATE TABLE "_AuthorToBook" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuthorToBook_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AuthorToBook_B_index" ON "_AuthorToBook"("B");

-- AddForeignKey
ALTER TABLE "_AuthorToBook" ADD CONSTRAINT "_AuthorToBook_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToBook" ADD CONSTRAINT "_AuthorToBook_B_fkey" FOREIGN KEY ("B") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
