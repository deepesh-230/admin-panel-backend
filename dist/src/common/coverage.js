"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCoverageFlag = parseCoverageFlag;
exports.sanitizeCoverage = sanitizeCoverage;
exports.coverageVisibilityWhere = coverageVisibilityWhere;
const client_1 = require("@prisma/client");
function parseCoverageFlag(value) {
    const raw = String(value || '').trim().toUpperCase();
    if (raw === 'STATE' || raw === 'ORANGE')
        return client_1.CoverageFlag.STATE;
    if (raw === 'LOCAL' || raw === 'GREEN')
        return client_1.CoverageFlag.LOCAL;
    return client_1.CoverageFlag.NATIONAL;
}
function sanitizeCoverage(data) {
    const coverageFlag = parseCoverageFlag(data.coverageFlag);
    const stateId = data.coverageStateId?.trim() || null;
    const city = data.coverageCity?.trim() || null;
    if (coverageFlag === client_1.CoverageFlag.NATIONAL) {
        return {
            coverageFlag,
            coverageStateId: null,
            coverageCity: null,
        };
    }
    if (coverageFlag === client_1.CoverageFlag.STATE) {
        return {
            coverageFlag,
            coverageStateId: stateId,
            coverageCity: null,
        };
    }
    return {
        coverageFlag,
        coverageStateId: stateId,
        coverageCity: city,
    };
}
function coverageVisibilityWhere(viewer) {
    const stateId = viewer?.stateId?.trim();
    const city = viewer?.city?.trim();
    const clauses = [
        { coverageFlag: client_1.CoverageFlag.NATIONAL },
    ];
    if (stateId) {
        clauses.push({
            coverageFlag: client_1.CoverageFlag.STATE,
            coverageStateId: stateId,
        });
    }
    if (city) {
        clauses.push({
            coverageFlag: client_1.CoverageFlag.LOCAL,
            coverageCity: { equals: city, mode: 'insensitive' },
            ...(stateId ? { coverageStateId: stateId } : {}),
        });
    }
    return { OR: clauses };
}
//# sourceMappingURL=coverage.js.map