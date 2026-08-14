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
exports.StatesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let StatesService = class StatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, isActive) {
        const where = {};
        if (typeof isActive === 'boolean') {
            where.isActive = isActive;
        }
        if (search?.trim()) {
            where.OR = [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { code: { contains: search.trim(), mode: 'insensitive' } },
            ];
        }
        return this.prisma.state.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const state = await this.prisma.state.findUnique({ where: { id } });
        if (!state)
            throw new common_1.NotFoundException(`State with ID ${id} not found`);
        return state;
    }
    async create(dto) {
        try {
            return await this.prisma.state.create({
                data: {
                    name: dto.name,
                    code: dto.code,
                    isActive: dto.isActive ?? true,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('State name or code already exists');
            }
            throw error;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        try {
            return await this.prisma.state.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.code !== undefined && { code: dto.code }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('State name or code already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        const linkedUsers = await this.prisma.user.count({
            where: {
                OR: [{ stateId: id }, { userStates: { some: { stateId: id } } }],
            },
        });
        if (linkedUsers > 0) {
            throw new common_1.BadRequestException('Cannot delete state while users are linked to it');
        }
        return this.prisma.state.delete({ where: { id } });
    }
};
exports.StatesService = StatesService;
exports.StatesService = StatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatesService);
//# sourceMappingURL=states.service.js.map