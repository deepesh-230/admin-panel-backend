import { RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMatrix(): Promise<{
        permissions: {
            id: string | null;
            code: string;
            description: string;
            group: string;
        }[];
        roles: {
            name: import("@prisma/client").$Enums.RoleName;
            label: string;
            description: string;
            editable: boolean;
        }[];
        matrix: Record<string, string[]>;
        defaults: {
            [k: string]: string[];
        };
    }>;
    setRolePermissions(roleName: RoleName, permissionCodes: string[]): Promise<{
        permissions: {
            id: string | null;
            code: string;
            description: string;
            group: string;
        }[];
        roles: {
            name: import("@prisma/client").$Enums.RoleName;
            label: string;
            description: string;
            editable: boolean;
        }[];
        matrix: Record<string, string[]>;
        defaults: {
            [k: string]: string[];
        };
    }>;
    updateMatrix(rolesInput: Partial<Record<RoleName, string[]>>): Promise<{
        permissions: {
            id: string | null;
            code: string;
            description: string;
            group: string;
        }[];
        roles: {
            name: import("@prisma/client").$Enums.RoleName;
            label: string;
            description: string;
            editable: boolean;
        }[];
        matrix: Record<string, string[]>;
        defaults: {
            [k: string]: string[];
        };
    }>;
    resetRole(roleName: RoleName): Promise<{
        permissions: {
            id: string | null;
            code: string;
            description: string;
            group: string;
        }[];
        roles: {
            name: import("@prisma/client").$Enums.RoleName;
            label: string;
            description: string;
            editable: boolean;
        }[];
        matrix: Record<string, string[]>;
        defaults: {
            [k: string]: string[];
        };
    }>;
    resetAllEditable(): Promise<{
        permissions: {
            id: string | null;
            code: string;
            description: string;
            group: string;
        }[];
        roles: {
            name: import("@prisma/client").$Enums.RoleName;
            label: string;
            description: string;
            editable: boolean;
        }[];
        matrix: Record<string, string[]>;
        defaults: {
            [k: string]: string[];
        };
    }>;
}
