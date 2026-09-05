import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_ROLE_PERMISSIONS,
  EDITABLE_ROLES,
  PERMISSION_CATALOG,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from './permission-registry';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatrix() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });

    const byCode = new Map(permissions.map((p) => [p.code, p]));
    const catalog = PERMISSION_CATALOG.map((def) => {
      const row = byCode.get(def.code);
      return {
        id: row?.id ?? null,
        code: def.code,
        description: row?.description || def.description,
        group: def.group,
      };
    });

    // Include any DB permissions not in the catalog (legacy / custom).
    for (const row of permissions) {
      if (!PERMISSION_CATALOG.some((p) => p.code === row.code)) {
        catalog.push({
          id: row.id,
          code: row.code,
          description: row.description || row.code,
          group: 'Other',
        });
      }
    }

    const roles = await this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });

    const matrix: Record<string, string[]> = {};
    const roleMeta = Object.values(RoleName).map((name) => {
      const role = roles.find((r) => r.name === name);
      const codes = role
        ? role.permissions.map((rp) => rp.permission.code).sort()
        : [...(DEFAULT_ROLE_PERMISSIONS[name] || [])].sort();
      matrix[name] = codes;
      return {
        name,
        label: ROLE_LABELS[name],
        description: role?.description || ROLE_DESCRIPTIONS[name],
        editable: EDITABLE_ROLES.includes(name),
      };
    });

    return {
      permissions: catalog,
      roles: roleMeta,
      matrix,
      defaults: DEFAULT_ROLE_PERMISSIONS,
    };
  }

  async setRolePermissions(roleName: RoleName, permissionCodes: string[]) {
    if (roleName === RoleName.ADMIN) {
      throw new ForbiddenException('Central Admin permissions cannot be edited');
    }
    if (!EDITABLE_ROLES.includes(roleName)) {
      throw new BadRequestException(`Role ${roleName} is not editable`);
    }

    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new NotFoundException(`Role ${roleName} not found`);

    const uniqueCodes = [...new Set(permissionCodes)];
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: uniqueCodes } },
    });
    if (permissions.length !== uniqueCodes.length) {
      const found = new Set(permissions.map((p) => p.code));
      const missing = uniqueCodes.filter((c) => !found.has(c));
      throw new BadRequestException(`Unknown permission code(s): ${missing.join(', ')}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      if (permissions.length) {
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: role.id,
            permissionId: p.id,
          })),
        });
      }
    });

    return this.getMatrix();
  }

  async updateMatrix(rolesInput: Partial<Record<RoleName, string[]>>) {
    const entries = Object.entries(rolesInput || {}) as [RoleName, string[]][];
    if (!entries.length) {
      throw new BadRequestException('No role permission updates provided');
    }

    for (const [roleName] of entries) {
      if (roleName === RoleName.ADMIN) continue;
      if (!Object.values(RoleName).includes(roleName)) {
        throw new BadRequestException(`Invalid role: ${roleName}`);
      }
      if (!EDITABLE_ROLES.includes(roleName)) {
        throw new BadRequestException(`Role ${roleName} is not editable`);
      }
    }

    const allCodes = [...new Set(entries.flatMap(([, codes]) => codes || []))];
    const permissions = allCodes.length
      ? await this.prisma.permission.findMany({ where: { code: { in: allCodes } } })
      : [];
    const byCode = new Map(permissions.map((p) => [p.code, p]));
    if (allCodes.length !== permissions.length) {
      const missing = allCodes.filter((c) => !byCode.has(c));
      throw new BadRequestException(`Unknown permission code(s): ${missing.join(', ')}`);
    }

    const roles = await this.prisma.role.findMany({
      where: { name: { in: EDITABLE_ROLES } },
    });
    const roleByName = new Map(roles.map((r) => [r.name, r]));

    await this.prisma.$transaction(async (tx) => {
      for (const [roleName, codes] of entries) {
        if (roleName === RoleName.ADMIN) continue;
        const role = roleByName.get(roleName);
        if (!role) throw new NotFoundException(`Role ${roleName} not found`);
        const uniqueCodes = [...new Set(codes || [])];
        await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
        if (uniqueCodes.length) {
          await tx.rolePermission.createMany({
            data: uniqueCodes.map((code) => ({
              roleId: role.id,
              permissionId: byCode.get(code)!.id,
            })),
          });
        }
      }
    });

    return this.getMatrix();
  }

  async resetRole(roleName: RoleName) {
    if (roleName === RoleName.ADMIN) {
      throw new ForbiddenException('Central Admin permissions cannot be reset via this endpoint');
    }
    const defaults = DEFAULT_ROLE_PERMISSIONS[roleName];
    if (!defaults) throw new BadRequestException(`No defaults for role ${roleName}`);
    return this.setRolePermissions(roleName, defaults);
  }

  async resetAllEditable() {
    for (const roleName of EDITABLE_ROLES) {
      await this.setRolePermissions(roleName, DEFAULT_ROLE_PERMISSIONS[roleName] || []);
    }
    return this.getMatrix();
  }
}
