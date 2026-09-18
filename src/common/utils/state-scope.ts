import { ForbiddenException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import type { AuthUser } from '../decorators/current-user.decorator';

/** All state ids assigned to a State Admin (UserState + primary stateId). */
export function assignedStateIds(currentUser: AuthUser): string[] {
  const ids = [...(currentUser.stateIds || [])];
  if (currentUser.stateId && !ids.includes(currentUser.stateId)) {
    ids.unshift(currentUser.stateId);
  }
  return [...new Set(ids.filter(Boolean))];
}

export function assertStateAccess(currentUser: AuthUser, targetStateId: string | null | undefined) {
  if (currentUser.role !== RoleName.STATE_ADMIN) return;
  const ids = assignedStateIds(currentUser);
  if (!targetStateId || !ids.includes(targetStateId)) {
    throw new ForbiddenException('You can only access records in your assigned state');
  }
}

export function assertAssignedStateOverlap(
  currentUser: AuthUser,
  recordStateIds: Array<string | null | undefined>,
) {
  if (currentUser.role !== RoleName.STATE_ADMIN) return;
  const assigned = assignedStateIds(currentUser);
  if (!recordStateIds.some((id) => Boolean(id) && assigned.includes(id as string))) {
    throw new ForbiddenException('You can only access records in your assigned state');
  }
}

export function resolveScopedStateId(
  currentUser: AuthUser,
  requestedStateId?: string,
): string | undefined {
  if (currentUser.role === RoleName.STATE_ADMIN) {
    const ids = assignedStateIds(currentUser);
    if (requestedStateId && ids.includes(requestedStateId)) return requestedStateId;
    return ids[0];
  }
  return requestedStateId;
}

/** Parse `stateId` query values: comma-separated or repeated params. */
export function parseStateIds(value?: string | string[] | null): string[] {
  const raw = Array.isArray(value) ? value.join(',') : String(value || '');
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
}

/**
 * List-filter state ids.
 * STATE_ADMIN is locked to assigned states (optional subset via query).
 * Other roles use the requested filter, or undefined = no state filter.
 */
export function resolveScopedStateIds(
  currentUser: AuthUser,
  requestedStateId?: string,
): string[] | undefined {
  if (currentUser.role === RoleName.STATE_ADMIN) {
    const assigned = assignedStateIds(currentUser);
    if (!assigned.length) return ['__none__'];
    const requested = parseStateIds(requestedStateId).filter((id) => assigned.includes(id));
    return requested.length ? requested : assigned;
  }
  const ids = parseStateIds(requestedStateId);
  return ids.length ? ids : undefined;
}
