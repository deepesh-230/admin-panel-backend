DROP INDEX IF EXISTS "Category_slug_key";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "slug";

DROP INDEX IF EXISTS "Subcategory_slug_key";
ALTER TABLE "Subcategory" DROP COLUMN IF EXISTS "slug";
