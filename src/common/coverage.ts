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
    return {
      coverageFlag,
      coverageStateId: stateId,
      coverageCity: null as string | null,
    };
  }
  return {
    coverageFlag,
    coverageStateId: stateId,
    coverageCity: city,
  };
}

/** Prisma OR clause so users only see listings that match their location. */
export function coverageVisibilityWhere(
  viewer?: ViewerLocation | null,
): Prisma.HomeBannerWhereInput {
  const stateId = viewer?.stateId?.trim();
  const city = viewer?.city?.trim();
  const clauses: Prisma.HomeBannerWhereInput[] = [
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
  return { OR: clauses };
}
