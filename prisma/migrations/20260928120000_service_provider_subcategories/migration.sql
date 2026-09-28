-- Multi-subcategory support for service providers
CREATE TABLE IF NOT EXISTS "ServiceProviderSubcategory" (
    "id" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceProviderSubcategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceProviderSubcategory_serviceProviderId_subcategoryId_key"
  ON "ServiceProviderSubcategory"("serviceProviderId", "subcategoryId");

CREATE INDEX IF NOT EXISTS "ServiceProviderSubcategory_subcategoryId_idx"
  ON "ServiceProviderSubcategory"("subcategoryId");

CREATE INDEX IF NOT EXISTS "ServiceProviderSubcategory_serviceProviderId_idx"
  ON "ServiceProviderSubcategory"("serviceProviderId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ServiceProviderSubcategory_serviceProviderId_fkey'
  ) THEN
    ALTER TABLE "ServiceProviderSubcategory"
      ADD CONSTRAINT "ServiceProviderSubcategory_serviceProviderId_fkey"
      FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ServiceProviderSubcategory_subcategoryId_fkey'
  ) THEN
    ALTER TABLE "ServiceProviderSubcategory"
      ADD CONSTRAINT "ServiceProviderSubcategory_subcategoryId_fkey"
      FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill from legacy single subcategoryId
INSERT INTO "ServiceProviderSubcategory" ("id", "serviceProviderId", "subcategoryId", "createdAt")
SELECT gen_random_uuid()::text, sp."id", sp."subcategoryId", CURRENT_TIMESTAMP
FROM "ServiceProvider" sp
WHERE sp."subcategoryId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "ServiceProviderSubcategory" link
    WHERE link."serviceProviderId" = sp."id"
      AND link."subcategoryId" = sp."subcategoryId"
  );
