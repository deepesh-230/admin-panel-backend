-- Help tickets may already exist from schema push. Create the original shape when missing.
CREATE TABLE IF NOT EXISTS "HelpTicket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- Link help tickets to the account, store an admin reply, and notify the user.
CREATE TYPE "HelpTicketStatus" AS ENUM ('OPEN', 'CLOSED');

ALTER TABLE "HelpTicket" ADD COLUMN "userId" TEXT;
ALTER TABLE "HelpTicket" ADD COLUMN "reply" TEXT;
ALTER TABLE "HelpTicket" ADD COLUMN "repliedAt" TIMESTAMP(3);

ALTER TABLE "HelpTicket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "HelpTicket"
  ALTER COLUMN "status" TYPE "HelpTicketStatus"
  USING (
    CASE
      WHEN UPPER("status") = 'CLOSED' THEN 'CLOSED'::"HelpTicketStatus"
      ELSE 'OPEN'::"HelpTicketStatus"
    END
  );
ALTER TABLE "HelpTicket" ALTER COLUMN "status" SET DEFAULT 'OPEN';

ALTER TABLE "HelpTicket"
  ADD CONSTRAINT "HelpTicket_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "HelpTicket_userId_idx" ON "HelpTicket"("userId");
CREATE INDEX "HelpTicket_status_idx" ON "HelpTicket"("status");
CREATE INDEX "HelpTicket_email_idx" ON "HelpTicket"("email");
CREATE INDEX "HelpTicket_createdAt_idx" ON "HelpTicket"("createdAt");

UPDATE "HelpTicket" AS t
SET "userId" = u.id
FROM "User" AS u
WHERE t."userId" IS NULL
  AND lower(t.email) = lower(u.email);

ALTER TYPE "BroadcastContentType" ADD VALUE 'HELP_TICKET';
