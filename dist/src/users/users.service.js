"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const state_scope_1 = require("../common/utils/state-scope");
const prisma_service_1 = require("../prisma/prisma.service");
const userInclude = {
    role: true,
    state: true,
    userStates: { include: { state: true } },
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitize(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            isActive: user.isActive,
            stateId: user.stateId,
            role: user.role.name,
            roleDetails: user.role,
            state: user.state,
            states: (user.userStates || []).map((us) => ({
                ...us.state,
                isPrimary: us.isPrimary,
            })),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async getRole(roleName) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role)
            throw new common_1.BadRequestException(`Role ${roleName} is not configured`);
        return role;
    }
    async findAll(currentUser, query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const skip = (page - 1) * limit;
        const stateId = (0, state_scope_1.resolveScopedStateId)(currentUser, query.stateId);
        const where = {};
        if (stateId)
            where.stateId = stateId;
        if (query.isActive === 'true')
            where.isActive = true;
        if (query.isActive === 'false')
            where.isActive = false;
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            if (query.role === client_1.RoleName.ADMIN) {
                return {
                    items: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                };
            }
            where.role = query.role
                ? { name: query.role }
                : { NOT: { name: client_1.RoleName.ADMIN } };
        }
        else if (query.role) {
            where.role = { name: query.role };
        }
        if (query.search?.trim()) {
            const q = query.search.trim();
            where.OR = [
                { email: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } },
            ];
        }
        const allowedSort = new Set(['createdAt', 'email', 'name', 'updatedAt']);
        const sortBy = allowedSort.has(query.sortBy || '') ? query.sortBy : 'createdAt';
        const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
        const [total, users] = await this.prisma.$transaction([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                include: userInclude,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
        ]);
        return {
            items: users.map((u) => this.sanitize(u)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0,
            },
        };
    }
    async findOne(id, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: userInclude,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            if (user.role.name === client_1.RoleName.ADMIN) {
                throw new common_1.ForbiddenException('Access denied');
            }
            (0, state_scope_1.assertStateAccess)(currentUser, user.stateId);
        }
        return this.sanitize(user);
    }
    async create(dto, currentUser) {
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            if (dto.role === client_1.RoleName.ADMIN || dto.role === client_1.RoleName.STATE_ADMIN) {
                throw new common_1.ForbiddenException('You cannot create this role');
            }
            if (!currentUser.stateId) {
                throw new common_1.ForbiddenException('State admin has no assigned state');
            }
            dto.stateId = currentUser.stateId;
        }
        if ((dto.role === client_1.RoleName.STATE_ADMIN || dto.role === client_1.RoleName.ADMIN) &&
            currentUser.role !== client_1.RoleName.ADMIN) {
            throw new common_1.ForbiddenException('Only main admin can create this role');
        }
        if (dto.role === client_1.RoleName.STATE_ADMIN && !dto.stateId) {
            throw new common_1.BadRequestException('stateId is required for STATE_ADMIN');
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        if (dto.stateId) {
            const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
            if (!state)
                throw new common_1.BadRequestException('Invalid stateId');
        }
        const role = await this.getRole(dto.role);
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                name: dto.name,
                phone: dto.phone,
                isActive: dto.isActive ?? true,
                roleId: role.id,
                stateId: dto.stateId,
                ...(dto.stateId
                    ? {
                        userStates: {
                            create: { stateId: dto.stateId, isPrimary: true },
                        },
                    }
                    : {}),
            },
            include: userInclude,
        });
        return this.sanitize(user);
    }
    async update(id, dto, currentUser) {
        const existing = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            if (existing.role.name === client_1.RoleName.ADMIN || existing.role.name === client_1.RoleName.STATE_ADMIN) {
                throw new common_1.ForbiddenException('Access denied');
            }
            (0, state_scope_1.assertStateAccess)(currentUser, existing.stateId);
            if (dto.role && dto.role !== existing.role.name) {
                const allowed = (existing.role.name === client_1.RoleName.END_USER && dto.role === client_1.RoleName.VOLUNTEER) ||
                    (existing.role.name === client_1.RoleName.VOLUNTEER && dto.role === client_1.RoleName.END_USER);
                if (!allowed) {
                    throw new common_1.ForbiddenException('You can only promote/demote END_USER ↔ VOLUNTEER');
                }
            }
            if (dto.stateId && dto.stateId !== currentUser.stateId) {
                throw new common_1.ForbiddenException('You cannot move users to another state');
            }
            dto.stateId = currentUser.stateId;
        }
        if (dto.role === client_1.RoleName.ADMIN && currentUser.role !== client_1.RoleName.ADMIN) {
            throw new common_1.ForbiddenException('Only main admin can assign ADMIN role');
        }
        if (dto.stateId) {
            const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
            if (!state)
                throw new common_1.BadRequestException('Invalid stateId');
        }
        let roleId;
        if (dto.role) {
            roleId = (await this.getRole(dto.role)).id;
        }
        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 12)
            : undefined;
        const user = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.user.update({
                where: { id },
                data: {
                    name: dto.name,
                    phone: dto.phone,
                    isActive: dto.isActive,
                    stateId: dto.stateId === undefined ? undefined : dto.stateId,
                    roleId,
                    passwordHash,
                },
                include: userInclude,
            });
            if (dto.stateId) {
                await tx.userState.upsert({
                    where: {
                        userId_stateId: { userId: id, stateId: dto.stateId },
                    },
                    update: { isPrimary: true },
                    create: { userId: id, stateId: dto.stateId, isPrimary: true },
                });
            }
            return updated;
        });
        return this.sanitize(user);
    }
    async updateStatus(id, isActive, currentUser) {
        return this.update(id, { isActive }, currentUser);
    }
    async remove(id, currentUser) {
        const existing = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        if (existing.id === currentUser.id) {
            throw new common_1.BadRequestException('You cannot delete your own account');
        }
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            if (existing.role.name === client_1.RoleName.ADMIN || existing.role.name === client_1.RoleName.STATE_ADMIN) {
                throw new common_1.ForbiddenException('Access denied');
            }
            (0, state_scope_1.assertStateAccess)(currentUser, existing.stateId);
        }
        if (existing.role.name === client_1.RoleName.ADMIN && currentUser.role !== client_1.RoleName.ADMIN) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.prisma.user.delete({ where: { id } });
        return { id, deleted: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map