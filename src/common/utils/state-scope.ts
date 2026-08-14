import { ForbiddenException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import type { AuthUser } from '../decorators/current-user.decorator';

export function assertStateAccess(currentUser: AuthUser, targetStateId: string | null | undefined) {
  if (currentUser.role !== RoleName.STATE_ADMIN) return;
  if (!currentUser.stateId || currentUser.stateId !== targetStateId) {
    throw new ForbiddenException('You can only access records in your assigned state');
  }
}

export function resolveScopedStateId(
  currentUser: AuthUser,
  requestedStateId?: string,
): string | undefined {
  if (currentUser.role === RoleName.STATE_ADMIN) {
    return currentUser.stateId ?? undefined;
  }
  return requestedStateId;
}
