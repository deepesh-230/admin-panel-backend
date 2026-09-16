-- AlterTable
ALTER TABLE "Category" ADD COLUMN "code" TEXT;

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_code_key" ON "Subcategory"("code");
