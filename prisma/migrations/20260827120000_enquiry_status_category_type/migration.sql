-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('CARE', 'SERVICE');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "type" "CategoryType" NOT NULL DEFAULT 'SERVICE';

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW';
ALTER TABLE "Enquiry" ADD COLUMN "providerId" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN "stateId" TEXT;

-- CreateIndex
CREATE INDEX "Category_type_idx" ON "Category"("type");

-- CreateIndex
CREATE INDEX "Enquiry_status_idx" ON "Enquiry"("status");

-- CreateIndex
CREATE INDEX "Enquiry_providerId_idx" ON "Enquiry"("providerId");

-- CreateIndex
CREATE INDEX "Enquiry_stateId_idx" ON "Enquiry"("stateId");

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;
