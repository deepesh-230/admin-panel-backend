CREATE TYPE "HelpTicketAuthor" AS ENUM ('USER', 'SUPPORT');

CREATE TABLE "HelpTicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "author" "HelpTicketAuthor" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HelpTicketMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HelpTicketMessage_ticketId_createdAt_idx" ON "HelpTicketMessage"("ticketId", "createdAt");

ALTER TABLE "HelpTicketMessage"
  ADD CONSTRAINT "HelpTicketMessage_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "HelpTicket"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "HelpTicketMessage" ("id", "ticketId", "author", "body", "createdAt")
SELECT gen_random_uuid()::text, t."id", 'USER'::"HelpTicketAuthor", t."message", t."createdAt"
FROM "HelpTicket" t
WHERE btrim(t."message") <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM "HelpTicketMessage" m
    WHERE m."ticketId" = t."id"
      AND m."author" = 'USER'::"HelpTicketAuthor"
      AND m."body" = t."message"
  );

INSERT INTO "HelpTicketMessage" ("id", "ticketId", "author", "body", "createdAt")
SELECT
  gen_random_uuid()::text,
  t."id",
  'SUPPORT'::"HelpTicketAuthor",
  t."reply",
  COALESCE(t."repliedAt", t."updatedAt")
FROM "HelpTicket" t
WHERE t."reply" IS NOT NULL
  AND btrim(t."reply") <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM "HelpTicketMessage" m
    WHERE m."ticketId" = t."id"
      AND m."author" = 'SUPPORT'::"HelpTicketAuthor"
      AND m."body" = t."reply"
  );
