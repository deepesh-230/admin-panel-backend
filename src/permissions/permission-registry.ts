import { RoleName } from '@prisma/client';

export type PermissionDef = {
  code: string;
  description: string;
  group: string;
};

/** Canonical permission catalog used by seed + config UI. */
export const PERMISSION_CATALOG: PermissionDef[] = [
  { code: 'dashboard.read', description: 'View dashboard statistics', group: 'Dashboard' },
  { code: 'users.read', description: 'View users', group: 'Users' },
  { code: 'users.write', description: 'Manage users', group: 'Users' },
  { code: 'listings.read', description: 'View listings', group: 'Listings' },
  { code: 'listings.write', description: 'Manage listings', group: 'Listings' },
  { code: 'enquiries.read', description: 'View enquiries', group: 'Enquiries' },
  { code: 'enquiries.write', description: 'Manage enquiries', group: 'Enquiries' },
  { code: 'providers.read', description: 'View service providers', group: 'Service providers' },
  { code: 'providers.write', description: 'Manage service providers', group: 'Service providers' },
  { code: 'settings.write', description: 'Manage settings & access control', group: 'Settings' },
  { code: 'states.read', description: 'View states', group: 'States' },
  { code: 'states.write', description: 'Manage states', group: 'States' },
  { code: 'state_admins.read', description: 'View state admins', group: 'State admins' },
  { code: 'state_admins.write', description: 'Manage state admins', group: 'State admins' },
  {
    code: 'categories.read',
    description: 'View categories, subcategories, and keywords',
    group: 'Categories',
  },
  {
    code: 'categories.write',
    description: 'Manage categories, subcategories, and keywords',
    group: 'Categories',
  },
  {
    code: 'cms.read',
    description: 'View FAQ, pages, blogs, links, jobs, help, suggestions',
    group: 'CMS',
  },
  {
    code: 'cms.write',
    description: 'Manage FAQ, pages, blogs, links, jobs, help, suggestions',
    group: 'CMS',
  },
  { code: 'volunteers.read', description: 'View volunteers', group: 'Volunteers' },
  { code: 'volunteers.write', description: 'Manage volunteers', group: 'Volunteers' },
  {
    code: 'marketplace.read',
    description: 'View marketplace products, buyers, and sellers',
    group: 'Marketplace',
  },
  {
    code: 'marketplace.write',
    description: 'Manage marketplace products, buyers, and sellers',
    group: 'Marketplace',
  },
  { code: 'payments.read', description: 'View payment records', group: 'Payments' },
  { code: 'payments.write', description: 'Manage payment records', group: 'Payments' },
];

/** Roles that Central Admin can edit on the access matrix. */
export const EDITABLE_ROLES: RoleName[] = [
  RoleName.STATE_ADMIN,
  RoleName.SERVICE_PROVIDER_ADMIN,
  RoleName.VOLUNTEER,
  RoleName.END_USER,
];

export const ROLE_LABELS: Record<RoleName, string> = {
  [RoleName.ADMIN]: 'Central Admin',
  [RoleName.STATE_ADMIN]: 'State Admin',
  [RoleName.SERVICE_PROVIDER_ADMIN]: 'Provider Admin',
  [RoleName.VOLUNTEER]: 'Volunteer',
  [RoleName.END_USER]: 'End User',
};

/** Default permission codes per role (seed + reset). ADMIN is always all codes. */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [RoleName.ADMIN]: PERMISSION_CATALOG.map((p) => p.code),
  [RoleName.STATE_ADMIN]: [
    'dashboard.read',
    'users.read',
    'users.write',
    'listings.read',
    'listings.write',
    'enquiries.read',
    'enquiries.write',
    'providers.read',
    'providers.write',
    'states.read',
    'state_admins.read',
    'categories.read',
    'categories.write',
    'cms.read',
    'cms.write',
    'volunteers.read',
    'volunteers.write',
    'marketplace.read',
    'marketplace.write',
    'payments.read',
    'payments.write',
  ],
  [RoleName.END_USER]: [],
  [RoleName.SERVICE_PROVIDER_ADMIN]: [
    'enquiries.read',
    'enquiries.write',
    'providers.read',
    'providers.write',
  ],
  [RoleName.VOLUNTEER]: [
    'volunteers.read',
    'volunteers.write',
    'enquiries.read',
    'enquiries.write',
  ],
};

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [RoleName.ADMIN]: 'Main platform administrator',
  [RoleName.STATE_ADMIN]: 'State-scoped administrator',
  [RoleName.END_USER]: 'Mobile end user',
  [RoleName.SERVICE_PROVIDER_ADMIN]: 'Service provider administrator',
  [RoleName.VOLUNTEER]: 'Volunteer coordinator',
};
