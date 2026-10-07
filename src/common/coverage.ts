import { CoverageFlag, Prisma } from '@prisma/client';

export type CoverageInput = {
  coverageFlag?: string | CoverageFlag | null;
  coverageStateId?: string | null;
  coverageCity?: string | null;
};

export type ViewerLocation = {
  stateId?: string;
  city?: string;
};

export function parseCoverageFlag(value?: string | null): CoverageFlag {
  const raw = String(value || '').trim().toUpperCase();
  if (raw === 'STATE' || raw === 'ORANGE') return CoverageFlag.STATE;
  if (raw === 'LOCAL' || raw === 'GREEN') return CoverageFlag.LOCAL;
  return CoverageFlag.NATIONAL;
}

export function sanitizeCoverage(data: CoverageInput) {
  const coverageFlag = parseCoverageFlag(data.coverageFlag);
  const stateId = data.coverageStateId?.trim() || null;
  const city = data.coverageCity?.trim() || null;

  if (coverageFlag === CoverageFlag.NATIONAL) {
    return {
      coverageFlag,
      coverageStateId: null as string | null,
      coverageCity: null as string | null,
    };
  }
  if (coverageFlag === CoverageFlag.STATE) {
    if (!stateId) {
      throw new Error('State is required for statewide (orange) coverage');
    }
    return {
      coverageFlag,
      coverageStateId: stateId,
      coverageCity: null as string | null,
    };
  }
  if (!stateId) {
    throw new Error('State is required for local (green) coverage');
  }
  if (!city) {
    throw new Error('City / local area is required for local (green) coverage');
  }
  return {
    coverageFlag,
    coverageStateId: stateId,
    coverageCity: city,
  };
}

/** Shared OR clauses so users only see listings that match their location. */
export function coverageVisibilityClauses(
  viewer?: ViewerLocation | null,
): Array<Record<string, unknown>> {
  const stateId = viewer?.stateId?.trim();
  const city = viewer?.city?.trim();
  const clauses: Array<Record<string, unknown>> = [
    { coverageFlag: CoverageFlag.NATIONAL },
  ];
  if (stateId) {
    clauses.push({
      coverageFlag: CoverageFlag.STATE,
      coverageStateId: stateId,
    });
  }
  if (city) {
    clauses.push({
      coverageFlag: CoverageFlag.LOCAL,
      coverageCity: { equals: city, mode: 'insensitive' },
      ...(stateId ? { coverageStateId: stateId } : {}),
    });
  }
  return clauses;
}

/** Prisma OR clause for HomeBanner (and any model with the same coverage fields). */
export function coverageVisibilityWhere(
  viewer?: ViewerLocation | null,
): Prisma.HomeBannerWhereInput {
  return { OR: coverageVisibilityClauses(viewer) as Prisma.HomeBannerWhereInput[] };
}

export function eventCoverageVisibilityWhere(
  viewer?: ViewerLocation | null,
): Prisma.EventWhereInput {
  return { OR: coverageVisibilityClauses(viewer) as Prisma.EventWhereInput[] };
}
