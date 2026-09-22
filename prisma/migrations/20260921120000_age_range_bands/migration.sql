-- Replace AgeRange enum with finer bands used by mobile registration.
-- Convert column to text, remap legacy values, recreate enum, cast back.

ALTER TABLE "User" ALTER COLUMN "ageRange" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "ageRange" TYPE TEXT USING "ageRange"::TEXT;

UPDATE "User" SET "ageRange" = CASE "ageRange"
  WHEN 'UNDER_18' THEN 'AGE_15_19'
  WHEN 'AGE_18_25' THEN 'AGE_20_24'
  WHEN 'AGE_26_40' THEN 'AGE_30_40'
  WHEN 'AGE_41_60' THEN 'AGE_50_60'
  WHEN 'AGE_60_PLUS' THEN 'AGE_60_PLUS'
  ELSE "ageRange"
END
WHERE "ageRange" IS NOT NULL;

DROP TYPE IF EXISTS "AgeRange";

CREATE TYPE "AgeRange" AS ENUM (
  'AGE_5_9',
  'AGE_10_14',
  'AGE_15_19',
  'AGE_20_24',
  'AGE_25_29',
  'AGE_30_40',
  'AGE_40_50',
  'AGE_50_60',
  'AGE_60_PLUS'
);

ALTER TABLE "User"
  ALTER COLUMN "ageRange" TYPE "AgeRange"
  USING (
    CASE
      WHEN "ageRange" IN (
        'AGE_5_9',
        'AGE_10_14',
        'AGE_15_19',
        'AGE_20_24',
        'AGE_25_29',
        'AGE_30_40',
        'AGE_40_50',
        'AGE_50_60',
        'AGE_60_PLUS'
      ) THEN "ageRange"::"AgeRange"
      ELSE NULL
    END
  );
