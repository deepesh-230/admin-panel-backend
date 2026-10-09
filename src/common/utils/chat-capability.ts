import { RoleName } from '@prisma/client';

const DASHBOARD_ONLY = new Set<string>([RoleName.ADMIN, RoleName.STATE_ADMIN]);

export type ChatPeerUser = {
  id: string;
  isActive?: boolean | null;
  role?: { name: string } | string | null;
};

export type ChatCapability = {
  chatEnabled: boolean;
  chatPeerId: string | null;
  enquiryOnlyReason: 'NO_PEER' | 'PLATFORM' | 'PEER_DASHBOARD_ONLY' | null;
};

export function roleNameOf(user?: ChatPeerUser | null): string | null {
  if (!user?.role) return null;
  return typeof user.role === 'string' ? user.role : user.role.name;
}

/** Roles that can use the mobile app and reply in chat. */
export function isChatCapableRole(role?: string | null): boolean {
  if (!role) return false;
  return !DASHBOARD_ONLY.has(role);
}

export function isChatCapableUser(user?: ChatPeerUser | null): boolean {
  if (!user?.id || user.isActive === false) return false;
  return isChatCapableRole(roleNameOf(user));
}

export function productChatCapability(
  createdBy?: ChatPeerUser | null,
): ChatCapability {
  if (!createdBy?.id) {
    return {
      chatEnabled: false,
      chatPeerId: null,
      enquiryOnlyReason: 'PLATFORM',
    };
  }
  if (!isChatCapableUser(createdBy)) {
    return {
      chatEnabled: false,
      chatPeerId: null,
      enquiryOnlyReason: 'PEER_DASHBOARD_ONLY',
    };
  }
  return {
    chatEnabled: true,
    chatPeerId: createdBy.id,
    enquiryOnlyReason: null,
  };
}

type ProviderAdminRow = {
  isPrimary?: boolean;
  user: ChatPeerUser;
};

/** Pick primary chat-capable SPA, else any capable admin, else capable creator. */
export function providerChatCapability(
  admins: ProviderAdminRow[] | null | undefined,
  createdBy?: ChatPeerUser | null,
): ChatCapability {
  const list = admins || [];
  const capableAdmins = list.filter((a) => isChatCapableUser(a.user));
  const primary = capableAdmins.find((a) => a.isPrimary);
  const peer =
    primary?.user ||
    capableAdmins[0]?.user ||
    (isChatCapableUser(createdBy) ? createdBy : null);

  if (peer?.id) {
    return {
      chatEnabled: true,
      chatPeerId: peer.id,
      enquiryOnlyReason: null,
    };
  }

  if (list.length > 0 || createdBy?.id) {
    return {
      chatEnabled: false,
      chatPeerId: null,
      enquiryOnlyReason: 'PEER_DASHBOARD_ONLY',
    };
  }

  return {
    chatEnabled: false,
    chatPeerId: null,
    enquiryOnlyReason: 'NO_PEER',
  };
}
