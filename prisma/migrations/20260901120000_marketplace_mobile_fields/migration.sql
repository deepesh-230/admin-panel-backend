-- Marketplace mobile fields + enquiry contact fields
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "brand" TEXT;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "features" TEXT;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "createdById" TEXT;

ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "marketplaceProductId" TEXT;

CREATE INDEX IF NOT EXISTS "MarketplaceProduct_createdById_idx" ON "MarketplaceProduct"("createdById");
CREATE INDEX IF NOT EXISTS "MarketplaceProduct_isActive_idx" ON "MarketplaceProduct"("isActive");
CREATE INDEX IF NOT EXISTS "Enquiry_marketplaceProductId_idx" ON "Enquiry"("marketplaceProductId");

DO $$ BEGIN
  ALTER TABLE "MarketplaceProduct"
    ADD CONSTRAINT "MarketplaceProduct_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Enquiry"
    ADD CONSTRAINT "Enquiry_marketplaceProductId_fkey"
    FOREIGN KEY ("marketplaceProductId") REFERENCES "MarketplaceProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
