-- Human-readable reference for offline email. Existing tickets keep the order they were opened.
CREATE SEQUENCE "HelpTicket_ticketNo_seq" START 1001;

ALTER TABLE "HelpTicket" ADD COLUMN "ticketNo" INTEGER;

WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS n
  FROM "HelpTicket"
)
UPDATE "HelpTicket" AS t
SET "ticketNo" = numbered.n + 1000
FROM numbered
WHERE t."id" = numbered."id";

SELECT setval(
  '"HelpTicket_ticketNo_seq"',
  GREATEST((SELECT COALESCE(MAX("ticketNo"), 1000) FROM "HelpTicket"), 1000)
);

ALTER TABLE "HelpTicket" ALTER COLUMN "ticketNo" SET NOT NULL;
ALTER TABLE "HelpTicket" ALTER COLUMN "ticketNo" SET DEFAULT nextval('"HelpTicket_ticketNo_seq"');
ALTER SEQUENCE "HelpTicket_ticketNo_seq" OWNED BY "HelpTicket"."ticketNo";

CREATE UNIQUE INDEX "HelpTicket_ticketNo_key" ON "HelpTicket"("ticketNo");
