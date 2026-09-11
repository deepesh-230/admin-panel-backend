import type { AuthUser } from '../decorators/current-user.decorator';
export declare function assertStateAccess(currentUser: AuthUser, targetStateId: string | null | undefined): void;
export declare function resolveScopedStateId(currentUser: AuthUser, requestedStateId?: string): string | undefined;
