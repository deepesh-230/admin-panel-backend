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
export declare function parseCoverageFlag(value?: string | null): CoverageFlag;
export declare function sanitizeCoverage(data: CoverageInput): {
    coverageFlag: CoverageFlag;
    coverageStateId: string | null;
    coverageCity: string | null;
};
export declare function coverageVisibilityWhere(viewer?: ViewerLocation | null): Prisma.HomeBannerWhereInput;
