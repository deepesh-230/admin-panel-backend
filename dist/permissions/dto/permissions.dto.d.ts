import { RoleName } from '@prisma/client';
export declare class UpdateRolePermissionsDto {
    permissionCodes: string[];
}
export declare class UpdatePermissionsMatrixDto {
    roles: Partial<Record<RoleName, string[]>>;
}
export declare class RoleNameParamDto {
    roleName: RoleName;
}
