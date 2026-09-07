-- CreateTable
CREATE TABLE IF NOT EXISTS "SocialSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialSetting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialSetting_isActive_idx" ON "SocialSetting"("isActive");
CREATE INDEX IF NOT EXISTS "SocialSetting_name_idx" ON "SocialSetting"("name");
