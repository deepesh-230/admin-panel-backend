-- Product visibility uses the same national / state / local flag as banners.
ALTER TABLE "MarketplaceProduct"
  ADD COLUMN "coverageFlag" "CoverageFlag" NOT NULL DEFAULT 'NATIONAL',
  ADD COLUMN "coverageStateId" TEXT,
  ADD COLUMN "coverageCity" TEXT;

CREATE INDEX "MarketplaceProduct_coverageFlag_idx" ON "MarketplaceProduct"("coverageFlag");
CREATE INDEX "MarketplaceProduct_coverageStateId_idx" ON "MarketplaceProduct"("coverageStateId");

ALTER TABLE "MarketplaceProduct"
  ADD CONSTRAINT "MarketplaceProduct_coverageStateId_fkey"
  FOREIGN KEY ("coverageStateId") REFERENCES "State"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
