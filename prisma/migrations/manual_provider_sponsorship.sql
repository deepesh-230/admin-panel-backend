-- Manual migration: business sponsorship (Get Featured multi-select)
-- Apply when DB is reachable: psql $DATABASE_URL -f prisma/migrations/manual_provider_sponsorship.sql
-- Or: npx prisma db push

CREATE TYPE "ProviderSponsorshipStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

ALTER TABLE "ServiceProvider"
  ADD COLUMN IF NOT EXISTS "sponsorPlanId" TEXT,
  ADD COLUMN IF NOT EXISTS "sponsoredUntil" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ServiceProvider_sponsoredUntil_idx" ON "ServiceProvider"("sponsoredUntil");
CREATE INDEX IF NOT EXISTS "ServiceProvider_sponsorPlanId_idx" ON "ServiceProvider"("sponsorPlanId");

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "serviceProviderIds" JSONB;

CREATE TABLE IF NOT EXISTS "ProviderSponsorship" (
  "id" TEXT NOT NULL,
  "serviceProviderId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "status" "ProviderSponsorshipStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProviderSponsorship_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProviderSponsorship_serviceProviderId_validUntil_idx"
  ON "ProviderSponsorship"("serviceProviderId", "validUntil");
CREATE INDEX IF NOT EXISTS "ProviderSponsorship_validUntil_idx" ON "ProviderSponsorship"("validUntil");
CREATE INDEX IF NOT EXISTS "ProviderSponsorship_paymentId_idx" ON "ProviderSponsorship"("paymentId");
CREATE INDEX IF NOT EXISTS "ProviderSponsorship_status_idx" ON "ProviderSponsorship"("status");
CREATE INDEX IF NOT EXISTS "ProviderSponsorship_planId_idx" ON "ProviderSponsorship"("planId");

ALTER TABLE "ProviderSponsorship"
  DROP CONSTRAINT IF EXISTS "ProviderSponsorship_serviceProviderId_fkey",
  DROP CONSTRAINT IF EXISTS "ProviderSponsorship_paymentId_fkey";

ALTER TABLE "ProviderSponsorship"
  ADD CONSTRAINT "ProviderSponsorship_serviceProviderId_fkey"
    FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ProviderSponsorship_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
