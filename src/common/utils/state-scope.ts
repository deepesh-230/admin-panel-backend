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

/** Parse `stateId` query values: comma-separated or repeated params. */
export function parseStateIds(value?: string | string[] | null): string[] {
  const raw = Array.isArray(value) ? value.join(',') : String(value || '');
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
}

/** List-filter state ids. STATE_ADMIN is always locked to their assigned state. */
export function resolveScopedStateIds(
  currentUser: AuthUser,
  requestedStateId?: string,
): string[] | undefined {
  if (currentUser.role === RoleName.STATE_ADMIN) {
    return currentUser.stateId ? [currentUser.stateId] : undefined;
  }
  const ids = parseStateIds(requestedStateId);
  return ids.length ? ids : undefined;
}
