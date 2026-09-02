-- AlterTable
ALTER TABLE "Faq" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Faq_slug_key" ON "Faq"("slug");
