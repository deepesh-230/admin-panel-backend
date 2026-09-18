CREATE INDEX IF NOT EXISTS "User_roleId_stateId_idx" ON "User"("roleId", "stateId");
CREATE INDEX IF NOT EXISTS "Payment_purpose_status_idx" ON "Payment"("purpose", "status");
CREATE INDEX IF NOT EXISTS "MarketplaceProduct_adminFlag_deletedAt_stateId_idx"
  ON "MarketplaceProduct"("adminFlag", "deletedAt", "stateId");
CREATE INDEX IF NOT EXISTS "Enquiry_adminFlag_deletedAt_status_idx"
  ON "Enquiry"("adminFlag", "deletedAt", "status");
