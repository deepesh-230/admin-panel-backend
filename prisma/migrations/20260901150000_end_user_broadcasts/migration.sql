-- CreateEnum
CREATE TYPE "BroadcastContentType" AS ENUM ('JOB_ALERT', 'USEFUL_LINK');

-- AlterTable
ALTER TABLE "JobAlert" ADD COLUMN "broadcastAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserBroadcast" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" "BroadcastContentType" NOT NULL,
    "jobAlertId" TEXT,
    "usefulLinkId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBroadcast_userId_readAt_idx" ON "UserBroadcast"("userId", "readAt");

-- CreateIndex
CREATE INDEX "UserBroadcast_userId_createdAt_idx" ON "UserBroadcast"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserBroadcast_jobAlertId_idx" ON "UserBroadcast"("jobAlertId");

-- CreateIndex
CREATE INDEX "UserBroadcast_usefulLinkId_idx" ON "UserBroadcast"("usefulLinkId");

-- AddForeignKey
ALTER TABLE "UserBroadcast" ADD CONSTRAINT "UserBroadcast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBroadcast" ADD CONSTRAINT "UserBroadcast_jobAlertId_fkey" FOREIGN KEY ("jobAlertId") REFERENCES "JobAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBroadcast" ADD CONSTRAINT "UserBroadcast_usefulLinkId_fkey" FOREIGN KEY ("usefulLinkId") REFERENCES "UsefulLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
