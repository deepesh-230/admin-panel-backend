/**
 * Upsert category/subcategory codes from the client CSV.
 *
 * Usage (from backend/):
 *   pnpm run seed:category-codes
 *
 * Behavior:
 * - Matches categories by name (cat_desc); creates if missing; sets code from cat_custom
 * - Matches subcategories by (category, name); creates if missing; sets code from subcat_custom
 * - Overwrites existing codes with CSV values (client list is source of truth)
 * - Does not delete existing categories/subcategories
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { CategoryType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase();
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? '').trim();
    });
    return row;
  });
}

async function main() {
  const csvPath = join(__dirname, '../prisma/data/cat_joins_subcat_codes.csv');
  const rows = parseCsv(readFileSync(csvPath, 'utf8'));
  console.log(`Loaded ${rows.length} rows from ${csvPath}`);

  let categoriesTouched = 0;
  let subcategoriesTouched = 0;

  for (const row of rows) {
    const catCode = normalizeCode(row.cat_custom || '');
    const catName = (row.cat_desc || '').trim();
    const subCode = normalizeCode(row.subcat_custom || '');
    const subName = (row.subcat_desc || '').trim();

    if (!catCode || !catName || !subCode || !subName) {
      console.warn('Skipping incomplete row', row);
      continue;
    }

    let category = await prisma.category.findFirst({
      where: { name: { equals: catName, mode: 'insensitive' } },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: catName,
          code: catCode,
          slug: slugify(catName),
          type: CategoryType.SERVICE,
          isActive: true,
          sortOrder: 0,
        },
      });
      categoriesTouched += 1;
      console.log(`Created category ${catCode} — ${catName}`);
    } else if (category.code !== catCode) {
      category = await prisma.category.update({
        where: { id: category.id },
        data: { code: catCode },
      });
      categoriesTouched += 1;
      console.log(`Updated category code ${catName} → ${catCode}`);
    }

    const existingSub = await prisma.subcategory.findFirst({
      where: {
        categoryId: category.id,
        name: { equals: subName, mode: 'insensitive' },
      },
    });

    if (!existingSub) {
      await prisma.subcategory.create({
        data: {
          categoryId: category.id,
          name: subName,
          code: subCode,
          slug: slugify(subName),
          isActive: true,
          sortOrder: 0,
        },
      });
      subcategoriesTouched += 1;
      console.log(`Created subcategory ${subCode} — ${subName}`);
    } else if (existingSub.code !== subCode) {
      await prisma.subcategory.update({
        where: { id: existingSub.id },
        data: { code: subCode },
      });
      subcategoriesTouched += 1;
      console.log(`Updated subcategory code ${subName} → ${subCode}`);
    }
  }

  console.log(
    `Done. Categories touched: ${categoriesTouched}, subcategories touched: ${subcategoriesTouched}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
