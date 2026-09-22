-- Marketplace sale/resale fields: condition sync, quantity, price history, sale status, geo

DO $$ BEGIN
  CREATE TYPE "MarketplaceItemCondition" AS ENUM ('NEW', 'USED', 'FREE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MarketplaceSaleStatus" AS ENUM ('NEWLY_ADDED', 'PENDING_SALE', 'SOLD');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "condition" "MarketplaceItemCondition";
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "previousOfferPrice" TEXT;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "offerPriceValue" DOUBLE PRECISION;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "saleStatus" "MarketplaceSaleStatus" NOT NULL DEFAULT 'NEWLY_ADDED';
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "soldAt" TIMESTAMP(3);
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Backfill saleStatus from approval
UPDATE "MarketplaceProduct"
SET "saleStatus" = CASE
  WHEN "approvalStatus" = 'APPROVED' THEN 'PENDING_SALE'::"MarketplaceSaleStatus"
  ELSE 'NEWLY_ADDED'::"MarketplaceSaleStatus"
END
WHERE "saleStatus" = 'NEWLY_ADDED';

-- Best-effort numeric price backfill
UPDATE "MarketplaceProduct"
SET "offerPriceValue" = NULLIF(regexp_replace(COALESCE("offerPrice", ''), '[^0-9.]', '', 'g'), '')::DOUBLE PRECISION
WHERE "offerPrice" IS NOT NULL AND "offerPriceValue" IS NULL;

CREATE INDEX IF NOT EXISTS "MarketplaceProduct_condition_idx" ON "MarketplaceProduct"("condition");
CREATE INDEX IF NOT EXISTS "MarketplaceProduct_saleStatus_idx" ON "MarketplaceProduct"("saleStatus");
CREATE INDEX IF NOT EXISTS "MarketplaceProduct_offerPriceValue_idx" ON "MarketplaceProduct"("offerPriceValue");
CREATE INDEX IF NOT EXISTS "MarketplaceProduct_latitude_longitude_idx" ON "MarketplaceProduct"("latitude", "longitude");
