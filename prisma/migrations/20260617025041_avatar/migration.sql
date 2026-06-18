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
