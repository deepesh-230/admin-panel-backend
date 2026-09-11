"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_DESCRIPTIONS = exports.DEFAULT_ROLE_PERMISSIONS = exports.ROLE_LABELS = exports.EDITABLE_ROLES = exports.PANEL_ROLES = exports.PERMISSION_CATALOG = void 0;
const client_1 = require("@prisma/client");
exports.PERMISSION_CATALOG = [
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
    { code: 'events.read', description: 'View events', group: 'Events' },
    { code: 'events.write', description: 'Create and manage events', group: 'Events' },
];
exports.PANEL_ROLES = [client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN];
exports.EDITABLE_ROLES = [client_1.RoleName.STATE_ADMIN];
exports.ROLE_LABELS = {
    [client_1.RoleName.ADMIN]: 'Central Admin',
    [client_1.RoleName.STATE_ADMIN]: 'State Admin',
    [client_1.RoleName.SERVICE_PROVIDER_ADMIN]: 'Provider Admin',
    [client_1.RoleName.VOLUNTEER]: 'Volunteer',
    [client_1.RoleName.END_USER]: 'End User',
};
exports.DEFAULT_ROLE_PERMISSIONS = {
    [client_1.RoleName.ADMIN]: exports.PERMISSION_CATALOG.map((p) => p.code),
    [client_1.RoleName.STATE_ADMIN]: [
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
        'events.read',
        'events.write',
    ],
    [client_1.RoleName.END_USER]: [],
    [client_1.RoleName.SERVICE_PROVIDER_ADMIN]: [
        'enquiries.read',
        'enquiries.write',
        'providers.read',
        'providers.write',
        'events.read',
        'events.write',
    ],
    [client_1.RoleName.VOLUNTEER]: [
        'volunteers.read',
        'volunteers.write',
        'enquiries.read',
        'enquiries.write',
    ],
};
exports.ROLE_DESCRIPTIONS = {
    [client_1.RoleName.ADMIN]: 'Main platform administrator',
    [client_1.RoleName.STATE_ADMIN]: 'State-scoped administrator',
    [client_1.RoleName.END_USER]: 'Mobile end user',
    [client_1.RoleName.SERVICE_PROVIDER_ADMIN]: 'Service provider administrator',
    [client_1.RoleName.VOLUNTEER]: 'Volunteer coordinator',
};
//# sourceMappingURL=permission-registry.js.map