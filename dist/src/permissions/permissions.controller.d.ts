import { RoleName } from '@prisma/client';
import { UpdatePermissionsMatrixDto, UpdateRolePermissionsDto } from './dto/permissions.dto';
import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
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
    updateMatrix(dto: UpdatePermissionsMatrixDto): Promise<{
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
    setRolePermissions(roleName: RoleName, dto: UpdateRolePermissionsDto): Promise<{
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
    resetAll(): Promise<{
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
