import { RoleName } from '@prisma/client';
export type PermissionDef = {
    code: string;
    description: string;
    group: string;
};
export declare const PERMISSION_CATALOG: PermissionDef[];
export declare const PANEL_ROLES: RoleName[];
export declare const EDITABLE_ROLES: RoleName[];
export declare const ROLE_LABELS: Record<RoleName, string>;
export declare const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]>;
export declare const ROLE_DESCRIPTIONS: Record<RoleName, string>;
