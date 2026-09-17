import { BadRequestException } from '@nestjs/common';
import { AgeRange } from '@prisma/client';
import { resolveDigipinFields } from '../digipin.util';
import { PrismaService } from '../../prisma/prisma.service';

type Db = {
  state: PrismaService['state'];
  subcategory: PrismaService['subcategory'];
  userDisability: PrismaService['userDisability'];
};

const STATE_ALIASES: Record<string, string> = {
  'nct of delhi': 'delhi',
  nct: 'delhi',
  orissa: 'odisha',
  pondicherry: 'puducherry',
  'dadra and nagar haveli': 'dadra and nagar haveli and daman and diu',
  'daman and diu': 'dadra and nagar haveli and daman and diu',
  'andaman and nicobar': 'andaman and nicobar islands',
};

function normalizeStateName(name: string) {
  const n = name.trim().toLowerCase().replace(/\s+/g, ' ');
  return STATE_ALIASES[n] || n;
}

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  UNDER_18: 'Under 18',
  AGE_18_25: '18-25',
  AGE_26_40: '26-40',
  AGE_41_60: '41-60',
  AGE_60_PLUS: '60+',
};

export async function findStateIdByName(db: Pick<Db, 'state'>, name: string) {
  const states = await db.state.findMany({ select: { id: true, name: true } });
  const want = normalizeStateName(name);
  return states.find((s) => normalizeStateName(s.name) === want)?.id ?? null;
}

export async function resolveStateId(
  db: Pick<Db, 'state'>,
  opts: { stateId?: string | null; stateName?: string | null },
): Promise<string | null | undefined> {
  if (opts.stateId) {
    const state = await db.state.findUnique({ where: { id: opts.stateId } });
    if (!state) throw new BadRequestException('Invalid stateId');
    return state.id;
  }
  if (opts.stateName?.trim()) {
    return (await findStateIdByName(db, opts.stateName)) ?? undefined;
  }
  if (opts.stateId === null) return null;
  return undefined;
}

export async function assertSubcategoryIds(db: Pick<Db, 'subcategory'>, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return unique;
  const rows = await db.subcategory.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });
  if (rows.length !== unique.length) {
    throw new BadRequestException('Invalid disability subcategory');
  }
  return unique;
}

export async function syncUserDisabilities(
  db: Pick<Db, 'userDisability'>,
  userId: string,
  subcategoryIds: string[],
) {
  await db.userDisability.deleteMany({
    where: { userId, subcategoryId: { notIn: subcategoryIds } },
  });
  if (!subcategoryIds.length) return;
  await db.userDisability.createMany({
    data: subcategoryIds.map((subcategoryId) => ({ userId, subcategoryId })),
    skipDuplicates: true,
  });
}

export type PlaceProfileInput = {
  location?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  stateId?: string | null;
  stateName?: string | null;
};

export async function resolvePlaceProfileFields(
  db: Pick<Db, 'state'>,
  input: PlaceProfileInput,
) {
  const stateId =
    input.stateId !== undefined || input.stateName
      ? await resolveStateId(db, { stateId: input.stateId, stateName: input.stateName })
      : undefined;

  const shouldRecomputeDigipin = input.latitude !== undefined && input.longitude !== undefined;
  const digipinFields = shouldRecomputeDigipin
    ? resolveDigipinFields(input.latitude, input.longitude, input.pincode)
    : input.pincode !== undefined
      ? { digipin: undefined as string | undefined, pincode: input.pincode.trim() || null }
      : {};

  return {
    ...(input.location !== undefined ? { location: input.location } : {}),
    ...(input.city !== undefined ? { city: input.city } : {}),
    ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
    ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
    ...(digipinFields.pincode !== undefined ? { pincode: digipinFields.pincode } : {}),
    ...(digipinFields.digipin !== undefined ? { digipin: digipinFields.digipin } : {}),
    ...(stateId !== undefined ? { stateId } : {}),
  };
}

export function parseCreatedAtRange(from?: string, to?: string) {
  const filter: { gte?: Date; lte?: Date } = {};
  if (from?.trim()) {
    const d = new Date(from.trim());
    if (!Number.isNaN(d.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(from.trim())) d.setHours(0, 0, 0, 0);
      filter.gte = d;
    }
  }
  if (to?.trim()) {
    const d = new Date(to.trim());
    if (!Number.isNaN(d.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(to.trim())) d.setHours(23, 59, 59, 999);
      filter.lte = d;
    }
  }
  return filter.gte || filter.lte ? filter : undefined;
}
