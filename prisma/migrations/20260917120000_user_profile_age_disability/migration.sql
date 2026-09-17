-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('UNDER_18', 'AGE_18_25', 'AGE_26_40', 'AGE_41_60', 'AGE_60_PLUS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "city" TEXT,
ADD COLUMN "ageRange" "AgeRange";

-- CreateIndex
CREATE INDEX "User_ageRange_idx" ON "User"("ageRange");
CREATE INDEX "User_city_idx" ON "User"("city");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateTable
CREATE TABLE "UserDisability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDisability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDisability_userId_subcategoryId_key" ON "UserDisability"("userId", "subcategoryId");
CREATE INDEX "UserDisability_subcategoryId_idx" ON "UserDisability"("subcategoryId");
CREATE INDEX "UserDisability_userId_idx" ON "UserDisability"("userId");

-- AddForeignKey
ALTER TABLE "UserDisability" ADD CONSTRAINT "UserDisability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserDisability" ADD CONSTRAINT "UserDisability_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
