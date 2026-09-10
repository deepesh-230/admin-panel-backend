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
    coverageFlag: "NATIONAL";
    coverageStateId: string | null;
    coverageCity: string | null;
} | {
    coverageFlag: "STATE";
    coverageStateId: string;
    coverageCity: string | null;
} | {
    coverageFlag: "LOCAL";
    coverageStateId: string;
    coverageCity: string;
};
export declare function coverageVisibilityWhere(viewer?: ViewerLocation | null): Prisma.HomeBannerWhereInput;
