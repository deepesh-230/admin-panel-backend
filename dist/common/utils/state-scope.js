"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertStateAccess = assertStateAccess;
exports.resolveScopedStateId = resolveScopedStateId;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
function assertStateAccess(currentUser, targetStateId) {
    if (currentUser.role !== client_1.RoleName.STATE_ADMIN)
        return;
    if (!currentUser.stateId || currentUser.stateId !== targetStateId) {
        throw new common_1.ForbiddenException('You can only access records in your assigned state');
    }
}
function resolveScopedStateId(currentUser, requestedStateId) {
    if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
        return currentUser.stateId ?? undefined;
    }
    return requestedStateId;
}
//# sourceMappingURL=state-scope.js.map