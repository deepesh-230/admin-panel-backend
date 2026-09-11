"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const permission_registry_1 = require("./permission-registry");
let PermissionsService = class PermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMatrix() {
        const permissions = await this.prisma.permission.findMany({
            orderBy: { code: 'asc' },
        });
        const byCode = new Map(permissions.map((p) => [p.code, p]));
        const catalog = permission_registry_1.PERMISSION_CATALOG.map((def) => {
            const row = byCode.get(def.code);
            return {
                id: row?.id ?? null,
                code: def.code,
                description: row?.description || def.description,
                group: def.group,
            };
        });
        for (const row of permissions) {
            if (!permission_registry_1.PERMISSION_CATALOG.some((p) => p.code === row.code)) {
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
        const matrix = {};
        const roleMeta = permission_registry_1.PANEL_ROLES.map((name) => {
            const role = roles.find((r) => r.name === name);
            const codes = role
                ? role.permissions.map((rp) => rp.permission.code).sort()
                : [...(permission_registry_1.DEFAULT_ROLE_PERMISSIONS[name] || [])].sort();
            matrix[name] = codes;
            return {
                name,
                label: permission_registry_1.ROLE_LABELS[name],
                description: role?.description || permission_registry_1.ROLE_DESCRIPTIONS[name],
                editable: permission_registry_1.EDITABLE_ROLES.includes(name),
            };
        });
        return {
            permissions: catalog,
            roles: roleMeta,
            matrix,
            defaults: Object.fromEntries(permission_registry_1.PANEL_ROLES.map((name) => [name, permission_registry_1.DEFAULT_ROLE_PERMISSIONS[name] || []])),
        };
    }
    async setRolePermissions(roleName, permissionCodes) {
        if (roleName === client_1.RoleName.ADMIN) {
            throw new common_1.ForbiddenException('Central Admin permissions cannot be edited');
        }
        if (!permission_registry_1.EDITABLE_ROLES.includes(roleName)) {
            throw new common_1.BadRequestException(`Role ${roleName} is not editable`);
        }
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role)
            throw new common_1.NotFoundException(`Role ${roleName} not found`);
        const uniqueCodes = [...new Set(permissionCodes)];
        const permissions = await this.prisma.permission.findMany({
            where: { code: { in: uniqueCodes } },
        });
        if (permissions.length !== uniqueCodes.length) {
            const found = new Set(permissions.map((p) => p.code));
            const missing = uniqueCodes.filter((c) => !found.has(c));
            throw new common_1.BadRequestException(`Unknown permission code(s): ${missing.join(', ')}`);
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
    async updateMatrix(rolesInput) {
        const entries = Object.entries(rolesInput || {});
        if (!entries.length) {
            throw new common_1.BadRequestException('No role permission updates provided');
        }
        for (const [roleName] of entries) {
            if (roleName === client_1.RoleName.ADMIN)
                continue;
            if (!Object.values(client_1.RoleName).includes(roleName)) {
                throw new common_1.BadRequestException(`Invalid role: ${roleName}`);
            }
            if (!permission_registry_1.EDITABLE_ROLES.includes(roleName)) {
                throw new common_1.BadRequestException(`Role ${roleName} is not editable`);
            }
        }
        const allCodes = [...new Set(entries.flatMap(([, codes]) => codes || []))];
        const permissions = allCodes.length
            ? await this.prisma.permission.findMany({ where: { code: { in: allCodes } } })
            : [];
        const byCode = new Map(permissions.map((p) => [p.code, p]));
        if (allCodes.length !== permissions.length) {
            const missing = allCodes.filter((c) => !byCode.has(c));
            throw new common_1.BadRequestException(`Unknown permission code(s): ${missing.join(', ')}`);
        }
        const roles = await this.prisma.role.findMany({
            where: { name: { in: permission_registry_1.EDITABLE_ROLES } },
        });
        const roleByName = new Map(roles.map((r) => [r.name, r]));
        await this.prisma.$transaction(async (tx) => {
            for (const [roleName, codes] of entries) {
                if (roleName === client_1.RoleName.ADMIN)
                    continue;
                const role = roleByName.get(roleName);
                if (!role)
                    throw new common_1.NotFoundException(`Role ${roleName} not found`);
                const uniqueCodes = [...new Set(codes || [])];
                await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
                if (uniqueCodes.length) {
                    await tx.rolePermission.createMany({
                        data: uniqueCodes.map((code) => ({
                            roleId: role.id,
                            permissionId: byCode.get(code).id,
                        })),
                    });
                }
            }
        });
        return this.getMatrix();
    }
    async resetRole(roleName) {
        if (roleName === client_1.RoleName.ADMIN) {
            throw new common_1.ForbiddenException('Central Admin permissions cannot be reset via this endpoint');
        }
        const defaults = permission_registry_1.DEFAULT_ROLE_PERMISSIONS[roleName];
        if (!defaults)
            throw new common_1.BadRequestException(`No defaults for role ${roleName}`);
        return this.setRolePermissions(roleName, defaults);
    }
    async resetAllEditable() {
        for (const roleName of permission_registry_1.EDITABLE_ROLES) {
            await this.setRolePermissions(roleName, permission_registry_1.DEFAULT_ROLE_PERMISSIONS[roleName] || []);
        }
        return this.getMatrix();
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map