import { RoleName } from '@prisma/client';
import {
  isChatCapableRole,
  productChatCapability,
  providerChatCapability,
} from './chat-capability';

describe('chat-capability', () => {
  it('treats ADMIN and STATE_ADMIN as not chat-capable', () => {
    expect(isChatCapableRole(RoleName.ADMIN)).toBe(false);
    expect(isChatCapableRole(RoleName.STATE_ADMIN)).toBe(false);
    expect(isChatCapableRole(RoleName.END_USER)).toBe(true);
    expect(isChatCapableRole(RoleName.SERVICE_PROVIDER_ADMIN)).toBe(true);
    expect(isChatCapableRole(RoleName.VOLUNTEER)).toBe(true);
  });

  it('disables product chat for platform and dashboard-only owners', () => {
    expect(productChatCapability(null).chatEnabled).toBe(false);
    expect(
      productChatCapability({
        id: 'u1',
        isActive: true,
        role: RoleName.STATE_ADMIN,
      }).enquiryOnlyReason,
    ).toBe('PEER_DASHBOARD_ONLY');
    expect(
      productChatCapability({
        id: 'u1',
        isActive: true,
        role: RoleName.END_USER,
      }),
    ).toEqual({
      chatEnabled: true,
      chatPeerId: 'u1',
      enquiryOnlyReason: null,
    });
  });

  it('picks primary chat-capable SPA for providers', () => {
    const result = providerChatCapability(
      [
        {
          isPrimary: false,
          user: { id: 'a', isActive: true, role: RoleName.END_USER },
        },
        {
          isPrimary: true,
          user: { id: 'b', isActive: true, role: RoleName.SERVICE_PROVIDER_ADMIN },
        },
      ],
      { id: 'creator', isActive: true, role: RoleName.ADMIN },
    );
    expect(result.chatPeerId).toBe('b');
    expect(result.chatEnabled).toBe(true);
  });

  it('disables provider chat when only dashboard-only peers remain', () => {
    const result = providerChatCapability(
      [
        {
          isPrimary: true,
          user: { id: 'a', isActive: true, role: RoleName.STATE_ADMIN },
        },
      ],
      { id: 'creator', isActive: true, role: RoleName.ADMIN },
    );
    expect(result.chatEnabled).toBe(false);
    expect(result.enquiryOnlyReason).toBe('PEER_DASHBOARD_ONLY');
  });
});
