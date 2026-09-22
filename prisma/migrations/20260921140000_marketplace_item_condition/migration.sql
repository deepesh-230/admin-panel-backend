-- CreateEnum
CREATE TYPE "MarketplaceItemCondition" AS ENUM ('NEW', 'USED', 'FREE');

-- AlterTable
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "condition" "MarketplaceItemCondition";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MarketplaceProduct_condition_idx" ON "MarketplaceProduct"("condition");
