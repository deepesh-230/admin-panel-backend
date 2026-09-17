-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");
CREATE INDEX IF NOT EXISTS "User_stateId_idx" ON "User"("stateId");
CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive");

CREATE INDEX IF NOT EXISTS "ServiceProvider_createdAt_idx" ON "ServiceProvider"("createdAt");
CREATE INDEX IF NOT EXISTS "ServiceProvider_latitude_longitude_idx" ON "ServiceProvider"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "ServiceProvider_approvalStatus_isActive_stateId_idx"
  ON "ServiceProvider"("approvalStatus", "isActive", "stateId");
CREATE INDEX IF NOT EXISTS "ServiceProvider_categoryId_subcategoryId_idx"
  ON "ServiceProvider"("categoryId", "subcategoryId");
