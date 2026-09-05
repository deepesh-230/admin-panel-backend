import { IsArray, IsEnum, IsObject, IsString } from 'class-validator';
import { RoleName } from '@prisma/client';

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionCodes!: string[];
}

export class UpdatePermissionsMatrixDto {
  @IsObject()
  roles!: Partial<Record<RoleName, string[]>>;
}

export class RoleNameParamDto {
  @IsEnum(RoleName)
  roleName!: RoleName;
}
