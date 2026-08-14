import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new PermissionsGuard(reflector);

  const makeContext = (user: Record<string, unknown> | null) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as never;

  it('allows when no permissions required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(makeContext({ role: RoleName.END_USER, permissions: [] }))).toBe(true);
  });

  it('allows ADMIN regardless of permission list', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['listings.write']);
    expect(
      guard.canActivate(makeContext({ role: RoleName.ADMIN, permissions: [] })),
    ).toBe(true);
  });

  it('allows user with required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['listings.read']);
    expect(
      guard.canActivate(
        makeContext({ role: RoleName.STATE_ADMIN, permissions: ['listings.read'] }),
      ),
    ).toBe(true);
  });

  it('rejects user missing required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['listings.write']);
    expect(() =>
      guard.canActivate(
        makeContext({ role: RoleName.STATE_ADMIN, permissions: ['listings.read'] }),
      ),
    ).toThrow(ForbiddenException);
  });
});
