-- Event coverage flags: nationwide / statewide / local (reuses CoverageFlag enum)
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "coverageFlag" "CoverageFlag" NOT NULL DEFAULT 'NATIONAL';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "coverageStateId" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "coverageCity" TEXT;

DO $$ BEGIN
  ALTER TABLE "Event"
    ADD CONSTRAINT "Event_coverageStateId_fkey"
    FOREIGN KEY ("coverageStateId") REFERENCES "State"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "Event_coverageFlag_idx" ON "Event"("coverageFlag");
CREATE INDEX IF NOT EXISTS "Event_coverageStateId_idx" ON "Event"("coverageStateId");
