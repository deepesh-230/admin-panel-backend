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
exports.VolunteerAdminsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const volunteerAdminInclude = {
    role: true,
};
let VolunteerAdminsService = class VolunteerAdminsService {
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
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async findAll(filters) {
        const where = {
            role: { name: client_1.RoleName.VOLUNTEER },
        };
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
            include: volunteerAdminInclude,
            orderBy: { createdAt: 'desc' },
        });
        return users.map((u) => this.sanitize(u));
    }
    async findOne(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, role: { name: client_1.RoleName.VOLUNTEER } },
            include: volunteerAdminInclude,
        });
        if (!user)
            throw new common_1.NotFoundException(`Volunteer account with ID ${id} not found`);
        return this.sanitize(user);
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const role = await this.prisma.role.findUniqueOrThrow({
            where: { name: client_1.RoleName.VOLUNTEER },
        });
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                name: dto.name,
                phone: dto.phone,
                roleId: role.id,
            },
            include: volunteerAdminInclude,
        });
        return this.sanitize(user);
    }
    async update(id, dto) {
        const existing = await this.prisma.user.findFirst({
            where: { id, role: { name: client_1.RoleName.VOLUNTEER } },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Volunteer account with ID ${id} not found`);
        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 12)
            : undefined;
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(passwordHash && { passwordHash }),
            },
            include: volunteerAdminInclude,
        });
        return this.sanitize(user);
    }
    async remove(id) {
        const existing = await this.prisma.user.findFirst({
            where: { id, role: { name: client_1.RoleName.VOLUNTEER } },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Volunteer account with ID ${id} not found`);
        await this.prisma.user.delete({ where: { id } });
        return { id, deleted: true };
    }
};
exports.VolunteerAdminsService = VolunteerAdminsService;
exports.VolunteerAdminsService = VolunteerAdminsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VolunteerAdminsService);
//# sourceMappingURL=volunteer-admins.service.js.map