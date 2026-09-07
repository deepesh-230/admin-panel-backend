-- Event ticket fields: registration link + contact info
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "registrationLink" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "contactInfo" TEXT;
