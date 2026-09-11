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
exports.StateAdminsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const state_scope_1 = require("../common/utils/state-scope");
const prisma_service_1 = require("../prisma/prisma.service");
const stateAdminInclude = {
    role: true,
    state: true,
};
let StateAdminsService = class StateAdminsService {
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
            role: user.role,
            state: user.state,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    scopedStateId(currentUser, requestedStateId) {
        return (0, state_scope_1.resolveScopedStateId)(currentUser, requestedStateId);
    }
    async findAll(currentUser, filters) {
        const stateId = this.scopedStateId(currentUser, filters.stateId);
        const where = {
            role: { name: client_1.RoleName.STATE_ADMIN },
        };
        if (stateId)
            where.stateId = stateId;
        if (typeof filters.isActive === 'boolean')
            where.isActive = filters.isActive;
        if (filters.search?.trim()) {
            const q = filters.search.trim();
            where.OR = [
                { email: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } },
            ];
        }
        const users = await this.prisma.user.findMany({
            where,
            include: stateAdminInclude,
            orderBy: { createdAt: 'desc' },
        });
        return users.map((u) => this.sanitize(u));
    }
    async findOne(id, currentUser) {
        const user = await this.prisma.user.findFirst({
            where: { id, role: { name: client_1.RoleName.STATE_ADMIN } },
            include: stateAdminInclude,
        });
        if (!user)
            throw new common_1.NotFoundException(`State admin with ID ${id} not found`);
        (0, state_scope_1.assertStateAccess)(currentUser, user.stateId);
        return this.sanitize(user);
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
        if (!state)
            throw new common_1.NotFoundException(`State with ID ${dto.stateId} not found`);
        const role = await this.prisma.role.findUniqueOrThrow({
            where: { name: client_1.RoleName.STATE_ADMIN },
        });
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                phone: dto.phone,
                roleId: role.id,
                stateId: dto.stateId,
                userStates: {
                    create: {
                        stateId: dto.stateId,
                        isPrimary: true,
                    },
                },
            },
            include: stateAdminInclude,
        });
        return this.sanitize(user);
    }
    async update(id, dto) {
        const existing = await this.prisma.user.findFirst({
            where: { id, role: { name: client_1.RoleName.STATE_ADMIN } },
        });
        if (!existing)
            throw new common_1.NotFoundException(`State admin with ID ${id} not found`);
        if (dto.stateId) {
            const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
            if (!state)
                throw new common_1.NotFoundException(`State with ID ${dto.stateId} not found`);
        }
        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 12)
            : undefined;
        const user = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.user.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.phone !== undefined && { phone: dto.phone }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    ...(dto.stateId !== undefined && { stateId: dto.stateId }),
                    ...(passwordHash && { passwordHash }),
                },
                include: stateAdminInclude,
            });
            if (dto.stateId && dto.stateId !== existing.stateId) {
                if (existing.stateId) {
                    await tx.userState.updateMany({
                        where: { userId: id, isPrimary: true },
                        data: { isPrimary: false },
                    });
                }
                await tx.userState.upsert({
                    where: {
                        userId_stateId: { userId: id, stateId: dto.stateId },
                    },
                    update: { isPrimary: true },
                    create: {
                        userId: id,
                        stateId: dto.stateId,
                        isPrimary: true,
                    },
                });
            }
            return updated;
        });
        return this.sanitize(user);
    }
    async remove(id) {
        const existing = await this.prisma.user.findFirst({
            where: { id, role: { name: client_1.RoleName.STATE_ADMIN } },
        });
        if (!existing)
            throw new common_1.NotFoundException(`State admin with ID ${id} not found`);
        await this.prisma.user.delete({ where: { id } });
        return { id, deleted: true };
    }
};
exports.StateAdminsService = StateAdminsService;
exports.StateAdminsService = StateAdminsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StateAdminsService);
//# sourceMappingURL=state-admins.service.js.map