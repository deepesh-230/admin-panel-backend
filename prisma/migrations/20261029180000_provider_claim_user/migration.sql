ALTER TABLE "ServiceProvider" ADD COLUMN "claimUserId" TEXT;

CREATE INDEX "ServiceProvider_claimUserId_idx" ON "ServiceProvider"("claimUserId");

ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_claimUserId_fkey" FOREIGN KEY ("claimUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
